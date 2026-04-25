import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

interface AttackPattern {
  count: number
  firstSeen: number
  lastSeen: number
  blocked: boolean
  blockedAt?: number
}

// In-memory store for attack detection (use Redis in production for multi-instance)
const suspiciousIPs = new Map<string, AttackPattern>()

const BLOCK_DURATION_MS = parseInt(process.env.DDOS_BLOCK_DURATION_MS || '3600000', 10) // 1 hour
const ATTACK_THRESHOLD = parseInt(process.env.DDOS_ATTACK_THRESHOLD || '200', 10) // requests
const ATTACK_WINDOW_MS = parseInt(process.env.DDOS_ATTACK_WINDOW_MS || '60000', 10) // 1 minute
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // clean up stale entries every 5 min

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, pattern] of suspiciousIPs.entries()) {
    const isExpiredBlock = pattern.blocked && pattern.blockedAt && now - pattern.blockedAt > BLOCK_DURATION_MS
    const isStaleEntry = !pattern.blocked && now - pattern.lastSeen > ATTACK_WINDOW_MS * 2
    if (isExpiredBlock || isStaleEntry) {
      suspiciousIPs.delete(ip)
    }
  }
}, CLEANUP_INTERVAL_MS)

/**
 * Extracts the real client IP, respecting proxy headers when trust proxy is set
 */
export function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

/**
 * DDoS attack detection middleware.
 * Tracks request rates per IP and blocks IPs that exceed the threshold.
 */
export function ddosProtection(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIP(req)
  const now = Date.now()

  let pattern = suspiciousIPs.get(ip)

  if (!pattern) {
    pattern = { count: 1, firstSeen: now, lastSeen: now, blocked: false }
    suspiciousIPs.set(ip, pattern)
    return next()
  }

  // Check if currently blocked
  if (pattern.blocked) {
    const elapsed = now - (pattern.blockedAt || 0)
    if (elapsed < BLOCK_DURATION_MS) {
      const retryAfter = Math.ceil((BLOCK_DURATION_MS - elapsed) / 1000)
      res.set('Retry-After', String(retryAfter))
      res.status(429).json({
        success: false,
        error: 'Your IP has been temporarily blocked due to suspicious activity.',
        code: 'IP_BLOCKED',
        retryAfter,
      })
      return
    }
    // Block expired — reset
    pattern.blocked = false
    pattern.count = 1
    pattern.firstSeen = now
    pattern.lastSeen = now
    return next()
  }

  // Reset window if outside attack window
  if (now - pattern.firstSeen > ATTACK_WINDOW_MS) {
    pattern.count = 1
    pattern.firstSeen = now
    pattern.lastSeen = now
    return next()
  }

  pattern.count++
  pattern.lastSeen = now

  // Detect attack
  if (pattern.count > ATTACK_THRESHOLD) {
    pattern.blocked = true
    pattern.blockedAt = now
    logger.warn('DDoS attack detected — IP blocked', {
      ip,
      requestCount: pattern.count,
      windowMs: ATTACK_WINDOW_MS,
      blockDurationMs: BLOCK_DURATION_MS,
      path: req.path,
      userAgent: req.headers['user-agent'],
    })
    res.status(429).json({
      success: false,
      error: 'Your IP has been temporarily blocked due to suspicious activity.',
      code: 'IP_BLOCKED',
      retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000),
    })
    return
  }

  next()
}

/**
 * IP blocklist middleware — blocks manually added IPs.
 * Reads from BLOCKED_IPS env var (comma-separated).
 */
const blockedIPs = new Set<string>(
  (process.env.BLOCKED_IPS || '').split(',').map((ip) => ip.trim()).filter(Boolean)
)

export function ipBlocklist(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIP(req)
  if (blockedIPs.has(ip)) {
    logger.warn('Blocked IP attempted access', { ip, path: req.path })
    res.status(403).json({
      success: false,
      error: 'Access denied.',
      code: 'IP_BLOCKED',
    })
    return
  }
  next()
}

/**
 * Returns current DDoS stats (for admin/monitoring use)
 */
export function getDdosStats() {
  const now = Date.now()
  let blocked = 0
  let suspicious = 0
  for (const pattern of suspiciousIPs.values()) {
    if (pattern.blocked && now - (pattern.blockedAt || 0) < BLOCK_DURATION_MS) blocked++
    else if (pattern.count > ATTACK_THRESHOLD / 2) suspicious++
  }
  return { totalTracked: suspiciousIPs.size, blocked, suspicious }
}
