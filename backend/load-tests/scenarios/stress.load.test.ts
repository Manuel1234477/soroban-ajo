import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 200 },   // Ramp up to 200 users
    { duration: '2m', target: 300 },   // Spike to 300 users
    { duration: '5m', target: 300 },   // Stay at 300 users
    { duration: '2m', target: 400 },   // Spike to 400 users
    { duration: '5m', target: 400 },   // Stay at 400 users
    { duration: '5m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.15'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate various API calls
  const endpoints = [
    '/api/groups',
    '/api/goals',
    '/api/users/profile',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.get(`${BASE_URL}${endpoint}`);

  const success = check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!success);

  sleep(Math.random() * 3);
}
