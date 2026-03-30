import { Router } from 'express';
import { HealthCheckService } from '../services/healthCheck';
import { register } from '../services/metricsService';
import { healthMonitor } from '../monitoring/healthMonitor';
import { alertingService } from '../monitoring/alerting';

const router = Router();
const healthCheck = new HealthCheckService();

// Upstream addition: Base route
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ajo-backend',
    version: '0.1.0'
  });
});

// Liveness probe (is the app running?)
router.get('/health/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness probe (is the app ready to serve traffic?)
router.get('/health/ready', async (req, res) => {
  const health = await healthCheck.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check
router.get('/health', async (req, res) => {
  const health = await healthCheck.getHealthStatus();
  res.json(health);
});

// Metrics endpoint for Prometheus
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Live monitor snapshot (latest poll result + alert history)
router.get('/health/monitor', (req, res) => {
  const snapshot = healthMonitor.getLastSnapshot();
  const alerts = alertingService.getHistory();
  res.json({ snapshot, alerts });
});

export const healthRouter = router;