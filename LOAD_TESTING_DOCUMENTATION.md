# Load Testing Framework Documentation

## Overview
This document describes the load testing framework implemented for the Soroban Ajo platform using k6.

## Framework Components

### 1. Load Test Scenarios

#### Authentication Load Test (`auth.load.test.ts`)
Tests authentication endpoints under load.

Stages:
- Ramp up to 20 users (30s)
- Ramp up to 50 users (1m)
- Ramp up to 100 users (2m)
- Maintain 100 users (1m)
- Ramp down to 0 (30s)

Thresholds:
- p95 response time < 500ms
- p99 response time < 1000ms
- Error rate < 5%

#### Groups Load Test (`groups.load.test.ts`)
Tests group creation, retrieval, and contributions.

Stages:
- Ramp up to 50 users (1m)
- Ramp up to 100 users (3m)
- Ramp up to 150 users (1m)
- Maintain 150 users (2m)
- Ramp down to 0 (1m)

Thresholds:
- p95 response time < 800ms
- p99 response time < 1500ms
- Error rate < 5%

#### Stress Test (`stress.load.test.ts`)
Tests system behavior under extreme load.

Stages:
- Ramp up to 100 users (2m)
- Ramp up to 200 users (5m)
- Spike to 300 users (2m)
- Maintain 300 users (5m)
- Spike to 400 users (2m)
- Maintain 400 users (5m)
- Ramp down to 0 (5m)

Thresholds:
- p95 response time < 1000ms
- p99 response time < 2000ms
- Error rate < 10%

#### Spike Test (`spike.load.test.ts`)
Tests system recovery from sudden traffic spikes.

Stages:
- Baseline: 10 users
- Sudden spike to 500 users (1m)
- Maintain 500 users (30s)
- Drop to baseline (10s)
- Larger spike to 1000 users (1m)
- Maintain 1000 users (30s)
- Ramp down to 0

Thresholds:
- p95 response time < 1500ms
- p99 response time < 3000ms
- Error rate < 15%

### 2. Performance Benchmarks

Located in `backend/load-tests/config/thresholds.ts`

Key metrics:
- Response time (p95, p99)
- Error rates
- Throughput (requests/second)
- Concurrent users
- Database query performance

### 3. Capacity Planning

Resource requirements defined for:
- Baseline load (2 instances, 1 vCPU, 2GB RAM)
- Target load (4 instances, 2 vCPU, 4GB RAM)
- Peak load (8 instances, 4 vCPU, 8GB RAM)

Scaling thresholds:
- Scale up: CPU > 70%, Memory > 80%, p95 > 1000ms
- Scale down: CPU < 30%, Memory < 40%, p95 < 200ms

## Installation

### Install k6
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

## Running Load Tests

### Run Individual Test
```bash
k6 run backend/load-tests/scenarios/auth.load.test.ts
```

### Run with Custom Base URL
```bash
k6 run -e BASE_URL=https://api.soroban-ajo.com backend/load-tests/scenarios/auth.load.test.ts
```

### Run All Tests
```bash
k6 run backend/load-tests/scenarios/auth.load.test.ts
k6 run backend/load-tests/scenarios/groups.load.test.ts
k6 run backend/load-tests/scenarios/stress.load.test.ts
k6 run backend/load-tests/scenarios/spike.load.test.ts
```

### Run with Output to InfluxDB
```bash
k6 run --out influxdb=http://localhost:8086/k6 backend/load-tests/scenarios/auth.load.test.ts
```

### Run with Cloud Output
```bash
k6 run --out cloud backend/load-tests/scenarios/auth.load.test.ts
```

## Interpreting Results

### Key Metrics

1. **http_req_duration**: Time from request start to response end
   - p(95): 95% of requests completed within this time
   - p(99): 99% of requests completed within this time

2. **http_req_failed**: Percentage of failed requests
   - Should be < 5% for normal load
   - Can be < 10-15% for stress tests

3. **http_reqs**: Total number of requests
   - Indicates throughput

4. **vus**: Virtual users (concurrent users)
   - Shows load level

### Success Criteria

Test passes if:
- All thresholds are met
- Error rate is within acceptable limits
- No critical errors or crashes
- System recovers after load

### Failure Analysis

If tests fail:
1. Check error logs
2. Review database performance
3. Check resource utilization (CPU, memory)
4. Identify bottlenecks
5. Optimize slow endpoints
6. Scale resources if needed

## Performance Benchmarks

### Expected Performance

| Metric | Baseline | Target | Acceptable |
|--------|----------|--------|------------|
| p95 Response Time | < 300ms | < 500ms | < 1000ms |
| p99 Response Time | < 600ms | < 1000ms | < 2000ms |
| Error Rate | < 1% | < 5% | < 10% |
| Throughput | > 200 req/s | > 100 req/s | > 50 req/s |
| Concurrent Users | 100 | 200 | 500 |

## Integration with CI/CD

Load tests can be integrated into CI/CD:

```yaml
- name: Run Load Tests
  run: |
    k6 run --quiet backend/load-tests/scenarios/auth.load.test.ts
    k6 run --quiet backend/load-tests/scenarios/groups.load.test.ts
```

## Monitoring During Tests

Monitor these metrics during load tests:
- CPU usage
- Memory usage
- Database connections
- Response times
- Error rates
- Network I/O
- Disk I/O

## Best Practices

1. Run tests in staging environment first
2. Start with small load and gradually increase
3. Monitor system resources during tests
4. Run tests during off-peak hours
5. Document baseline performance
6. Compare results over time
7. Test realistic user scenarios
8. Include think time (sleep) between requests
9. Use realistic data volumes
10. Test error handling and recovery

## Troubleshooting

### High Error Rates
- Check database connection pool
- Review API error logs
- Verify network connectivity
- Check rate limiting

### Slow Response Times
- Identify slow database queries
- Check for N+1 query problems
- Review caching strategy
- Optimize hot code paths

### System Crashes
- Check memory leaks
- Review error handling
- Verify resource limits
- Check for deadlocks

## Future Enhancements

- Automated performance regression detection
- Real-time monitoring dashboard
- Distributed load testing
- Geographic load distribution
- Custom metrics and reporting
- Integration with APM tools
