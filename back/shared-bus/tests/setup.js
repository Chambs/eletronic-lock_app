// Jest setup file for shared-bus tests

// Set longer timeout for integration tests
jest.setTimeout(30000);

// Custom matchers for event bus
expect.extend({
  toBeValidEventType(received) {
    const validTypes = [
      'LOCK_ACTION',
      'ADMIN_REMOVED',
      'USER_REMOVED',
      'USER_JOINED',
      'EMAIL_UPDATED',
      'LOCK_REGISTERED'
    ];
    const pass = validTypes.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid event type`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid event type (one of: ${validTypes.join(', ')})`,
        pass: false,
      };
    }
  },

  toBeValidEvent(received) {
    const hasType = received && typeof received.type === 'string';
    const hasData = received && typeof received.data === 'object';
    const pass = hasType && hasData;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid event`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid event with 'type' (string) and 'data' (object)`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  generateTestEvent: (type = 'LOCK_ACTION') => ({
    type,
    data: {
      user: `test_${Date.now()}@test.com`,
      action: 'opened',
      code: 'LOCK1',
      timestamp: new Date().toISOString()
    }
  }),

  generateAdminRemovedEvent: (lockCode = 'LOCK1') => ({
    type: 'ADMIN_REMOVED',
    data: { lockCode }
  }),

  generateUserRemovedEvent: (email = 'test@test.com', code = 'LOCK1') => ({
    type: 'USER_REMOVED',
    data: { email, code }
  }),

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Cleanup function
global.afterEach(() => {
  jest.clearAllMocks();
});

