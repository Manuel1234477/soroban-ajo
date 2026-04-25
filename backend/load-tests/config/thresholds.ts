export const performanceThresholds = {
  // Response time thresholds
  responseTime: {
    p95: 500,   // 95th percentile should be under 500ms
    p99: 1000,  // 99th percentile should be under 1000ms
  },

  // Error rate thresholds
  errorRate: {
    max: 0.05,  // Maximum 5% error rate
  },

  // Throughput thresholds
  throughput: {
    min: 100,   // Minimum 100 requests per second
  },

  // Concurrent users
  concurrentUsers: {
    baseline: 50,
    target: 200,
    stress: 500,
    spike: 1000,
  },

  // Database query thresholds
  database: {
    queryTime: {
      p95: 100,  // 95th percentile under 100ms
      p99: 200,  // 99th percentile under 200ms
    },
    connectionPool: {
      max: 100,
      min: 10,
    },
  },

  // API endpoint specific thresholds
  endpoints: {
    '/api/auth/login': {
      p95: 300,
      p99: 600,
    },
    '/api/groups': {
      p95: 500,
      p99: 1000,
    },
    '/api/contributions': {
      p95: 400,
      p99: 800,
    },
  },
};

export const capacityPlan = {
  // Expected traffic patterns
  traffic: {
    daily: {
      peak: '12:00-14:00',
      low: '02:00-06:00',
    },
    weekly: {
      peak: 'Monday-Friday',
      low: 'Saturday-Sunday',
    },
  },

  // Scaling thresholds
  scaling: {
    scaleUp: {
      cpuThreshold: 70,      // Scale up at 70% CPU
      memoryThreshold: 80,   // Scale up at 80% memory
      responseTime: 1000,    // Scale up if p95 > 1000ms
    },
    scaleDown: {
      cpuThreshold: 30,      // Scale down at 30% CPU
      memoryThreshold: 40,   // Scale down at 40% memory
      responseTime: 200,     // Scale down if p95 < 200ms
    },
  },

  // Resource requirements
  resources: {
    baseline: {
      instances: 2,
      cpu: '1 vCPU',
      memory: '2 GB',
    },
    target: {
      instances: 4,
      cpu: '2 vCPU',
      memory: '4 GB',
    },
    peak: {
      instances: 8,
      cpu: '4 vCPU',
      memory: '8 GB',
    },
  },
};
