import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

interface ThrottleEntry {
  queue: number[]   // timestamps of recent requests
  delayUntil: number
}

const throttleStore = new Map<string, ThrottleEntry>()

const THROTTLE_WINDOW_MS = parseInt(process.env.THROTTLE_WINDOW_MS || '1000', 10)  // 1 second
const THROTTLE_MAX_RPS = parseInt(process.env.THROTTLE_MAX_RPS || '10', 10)         // max req/sec per IP
const THROTTLE_DELAY_MS = parseInt(process.env.THROTTLE_DELAY_MS || '500', 10)      // delay added per excess req

// Cleanup stale entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of throttleStore.entries()) {
    if (now - (entry.queue[entry.queue.length - 1] || 0) > THROTTLE_WINDOW_MS * 10) {
      throttleStore.delete(ip)
    }
  }
}, 60_000)

/**
 * Request throttling middleware.
 * Adds progressive delay to IPs that exceed the per-second request rate,
 * rather than hard-blocking them immediately.
 */
export function requestThrottle(req: Request, res: Response, next: NextFunction): void {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'

  const now = Date.now()
  let entry = throttleStore.get(ip)

  if (!entry) {
    throttleStore.set(ip, { queue: [now], delayUntil: 0 })
    return next()
  }

  // Prune requests outside the window
  entry.queue = entry.queue.filter((t) => now - t < THROTTLE_WINDOW_MS)
  entry.queue.push(now)

  const excess = entry.queue.length - THROTTLE_MAX_RPS

  if (excess <= 0) {
    entry.delayUntil = 0
    return next()
  }

  // Progressive delay: each excess request adds THROTTLE_DELAY_MS
  const delay = excess * THROTTLE_DELAY_MS
  entry.delayUntil = now + delay

  logger.debug('Request throttled', { ip, excess, delay, path: req.path })

  // Set header so client knows they're being slowed
  res.set('X-RateLimit-Throttled', 'true')

  setTimeout(() => next(), delay)
}
