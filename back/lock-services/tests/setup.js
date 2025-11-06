// Jest setup file for lock-services tests

// Set longer timeout for integration tests
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Add custom matchers if needed
expect.extend({
  toBeValidLockCode(received) {
    const pass = /^LOCK\d+$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid lock code`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid lock code (format: LOCK<number>)`,
        pass: false,
      };
    }
  },
  
  toBeValidInviteCode(received) {
    const pass = /^invite\d+$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid invite code`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid invite code (format: invite<number>)`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Mock external services by default
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  get: jest.fn().mockResolvedValue({ status: 200, data: {} }),
}));

// Global test utilities
global.testUtils = {
  generateTestEmail: () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
  
  generateTestLockData: () => ({
    code: `LOCK${Math.floor(Math.random() * 1000)}`,
    nickname: `Test Lock ${Date.now()}`,
    admin: `admin_${Date.now()}@test.com`
  }),
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Cleanup function to reset state between tests
global.afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

