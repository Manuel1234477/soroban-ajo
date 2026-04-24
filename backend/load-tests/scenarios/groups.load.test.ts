import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Create a test user and get token
  const registerPayload = JSON.stringify({
    email: `setupuser${Date.now()}@example.com`,
    password: 'LoadTest123!',
    name: 'Setup User'
  });

  const res = http.post(
    `${BASE_URL}/api/auth/register`,
    registerPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return { token: JSON.parse(res.body).token };
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Test group creation
  const createGroupPayload = JSON.stringify({
    name: `Load Test Group ${Date.now()}`,
    description: 'Testing group creation under load',
    targetAmount: 10000
  });

  const createRes = http.post(
    `${BASE_URL}/api/groups`,
    createGroupPayload,
    params
  );

  const createSuccess = check(createRes, {
    'group creation status is 201': (r) => r.status === 201,
    'group has id': (r) => JSON.parse(r.body).id !== undefined,
  });

  errorRate.add(!createSuccess);

  if (createSuccess) {
    const groupId = JSON.parse(createRes.body).id;

    // Test group retrieval
    const getRes = http.get(`${BASE_URL}/api/groups/${groupId}`, params);

    const getSuccess = check(getRes, {
      'group retrieval status is 200': (r) => r.status === 200,
      'group data matches': (r) => JSON.parse(r.body).id === groupId,
    });

    errorRate.add(!getSuccess);

    // Test contribution
    const contributionPayload = JSON.stringify({
      amount: 1000
    });

    const contributeRes = http.post(
      `${BASE_URL}/api/groups/${groupId}/contributions`,
      contributionPayload,
      params
    );

    const contributeSuccess = check(contributeRes, {
      'contribution status is 201': (r) => r.status === 201,
    });

    errorRate.add(!contributeSuccess);
  }

  sleep(1);
}
