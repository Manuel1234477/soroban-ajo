/**
 * healthMonitor.ts
 * Periodic health monitoring that polls service dependencies and updates
 * Prometheus gauges + triggers alerts when thresholds are breached.
 */
import { HealthCheckService } from '../services/healthCheck';
import { AlertingService, AlertSeverity } from './alerting';
import { serviceHealthGauge, snapshotSystemMetrics } from './metricsCollector';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('HealthMonitor');

export interface ServiceCheckResult {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

export interface MonitorSnapshot {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceCheckResult[];
  uptime: number;
}

export class HealthMonitor {
  private readonly healthCheck: HealthCheckService;
  private readonly alerting: AlertingService;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private lastSnapshot: MonitorSnapshot | null = null;

  /** How often (ms) to run the health poll. Default: 30 s */
  private readonly pollIntervalMs: number;

  constructor(
    pollIntervalMs = 30_000,
    healthCheck = new HealthCheckService(),
    alerting = new AlertingService(),
  ) {
    this.pollIntervalMs = pollIntervalMs;
    this.healthCheck = healthCheck;
    this.alerting = alerting;
  }

  /** Start the background polling loop. */
  start(): void {
    if (this.intervalHandle) return; // already running
    logger.info('HealthMonitor started', { pollIntervalMs: this.pollIntervalMs });
    // Run immediately, then on interval
    void this.runChecks();
    this.intervalHandle = setInterval(() => void this.runChecks(), this.pollIntervalMs);
  }

  /** Stop the polling loop. */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      logger.info('HealthMonitor stopped');
    }
  }

  /** Return the most recent snapshot (null if no check has run yet). */
  getLastSnapshot(): MonitorSnapshot | null {
    return this.lastSnapshot;
  }

  /** Run all checks once and update metrics / alerts. */
  async runChecks(): Promise<MonitorSnapshot> {
    try {
      const health = await this.healthCheck.getHealthStatus();
      await snapshotSystemMetrics();

      const services: ServiceCheckResult[] = Object.entries(health.checks).map(
        ([name, result]) => ({ name, ...result }),
      );

      // Update Prometheus gauges
      for (const svc of services) {
        serviceHealthGauge.set({ service: svc.name }, svc.status === 'up' ? 1 : 0);
      }

      // Fire alerts for any downed service
      for (const svc of services) {
        if (svc.status === 'down') {
          await this.alerting.fire({
            severity: AlertSeverity.CRITICAL,
            service: svc.name,
            message: `Service "${svc.name}" is DOWN`,
            details: svc.error,
          });
        }
      }

      const snapshot: MonitorSnapshot = {
        timestamp: health.timestamp,
        overall: health.status,
        services,
        uptime: health.uptime,
      };

      this.lastSnapshot = snapshot;
      logger.debug('Health check completed', { overall: snapshot.overall });
      return snapshot;
    } catch (err) {
      logger.error('HealthMonitor runChecks failed', { error: err });
      throw err;
    }
  }
}

// Singleton instance used by the app
export const healthMonitor = new HealthMonitor();
