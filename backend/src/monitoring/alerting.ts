/**
 * alerting.ts
 * Lightweight alerting service: deduplicates alerts, enforces cooldowns,
 * logs them, and updates Prometheus counters.
 */
import { createModuleLogger } from '../utils/logger';
import { alertsFiredTotal } from './metricsCollector';

const logger = createModuleLogger('AlertingService');

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface Alert {
  severity: AlertSeverity;
  service: string;
  message: string;
  details?: string;
}

interface AlertRecord extends Alert {
  firedAt: Date;
}

/** Default cooldown per (service + severity) key: 5 minutes */
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

export class AlertingService {
  /** Tracks the last time each alert key was fired to prevent spam. */
  private readonly cooldowns = new Map<string, Date>();
  private readonly cooldownMs: number;

  /** In-memory history of fired alerts (capped at 200 entries). */
  private readonly history: AlertRecord[] = [];
  private readonly maxHistory = 200;

  constructor(cooldownMs = DEFAULT_COOLDOWN_MS) {
    this.cooldownMs = cooldownMs;
  }

  /**
   * Fire an alert.
   * Skips if the same (service + severity) alert was fired within the cooldown window.
   */
  async fire(alert: Alert): Promise<void> {
    const key = `${alert.service}:${alert.severity}`;
    const lastFired = this.cooldowns.get(key);
    const now = new Date();

    if (lastFired && now.getTime() - lastFired.getTime() < this.cooldownMs) {
      logger.debug('Alert suppressed (cooldown)', { key });
      return;
    }

    this.cooldowns.set(key, now);
    this.record({ ...alert, firedAt: now });

    // Update Prometheus counter
    alertsFiredTotal.inc({ severity: alert.severity, service: alert.service });

    // Log at appropriate level
    const logMeta = {
      service: alert.service,
      severity: alert.severity,
      details: alert.details,
    };

    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        logger.error(`[ALERT] ${alert.message}`, logMeta);
        break;
      case AlertSeverity.WARNING:
        logger.warn(`[ALERT] ${alert.message}`, logMeta);
        break;
      default:
        logger.info(`[ALERT] ${alert.message}`, logMeta);
    }

    // Hook: extend here to push to PagerDuty / Slack / SNS etc.
    await this.dispatch(alert);
  }

  /** Return a copy of the alert history. */
  getHistory(): AlertRecord[] {
    return [...this.history];
  }

  /** Clear cooldown state (useful in tests). */
  resetCooldowns(): void {
    this.cooldowns.clear();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private record(record: AlertRecord): void {
    this.history.push(record);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Dispatch hook — override or extend to integrate external channels.
   * Currently a no-op placeholder.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async dispatch(_alert: Alert): Promise<void> {
    // TODO: integrate Slack / PagerDuty / SNS webhook here
  }
}

// Singleton instance
export const alertingService = new AlertingService();
