import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test user registration
  const registerPayload = JSON.stringify({
    email: `loadtest${Date.now()}${Math.random()}@example.com`,
    password: 'LoadTest123!',
    name: 'Load Test User'
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    registerPayload,
    registerParams
  );

  const registerSuccess = check(registerRes, {
    'registration status is 201': (r) => r.status === 201,
    'registration has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  errorRate.add(!registerSuccess);

  if (registerSuccess) {
    const token = JSON.parse(registerRes.body).token;

    // Test authenticated request
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const profileRes = http.get(`${BASE_URL}/api/users/profile`, authParams);

    const profileSuccess = check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => JSON.parse(r.body).id !== undefined,
    });

    errorRate.add(!profileSuccess);
  }

  sleep(1);
}
