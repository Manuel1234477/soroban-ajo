import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Baseline
    { duration: '1m', target: 500 },    // Sudden spike
    { duration: '30s', target: 500 },   // Maintain spike
    { duration: '10s', target: 10 },    // Drop back to baseline
    { duration: '30s', target: 10 },    // Maintain baseline
    { duration: '1m', target: 1000 },   // Larger spike
    { duration: '30s', target: 1000 },  // Maintain larger spike
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.15'],
    errors: ['rate<0.2'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!success);

  sleep(0.5);
}
