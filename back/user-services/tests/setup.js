// Jest setup file for user-services tests

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
  
  generateTestUserData: () => ({
    name: `Test User ${Date.now()}`,
    email: `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
    password: 'TestPassword123!',
  }),
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Cleanup function to reset state between tests
global.afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

