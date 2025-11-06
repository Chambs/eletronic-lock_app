// Mock dependencies first
const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('express', () => {
  return {
    Router: jest.fn(() => mockRouter)
  };
});

const mockUploadSingle = jest.fn();
const mockControllers = {
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  lockAction: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  join: jest.fn(),
  removeCode: jest.fn(),
  upload: {
    single: jest.fn(() => mockUploadSingle)
  }
};

// Mock controllers - Jest should match this to './controllers' in routes.js
jest.mock('../../controllers', () => mockControllers);

describe('Routes - Unit Tests', () => {
  let routes;
  let routeCalls; // Store calls immediately to prevent clearing

  beforeAll(() => {
    // Load routes module - this will register all routes
    routes = require('../../routes');
    
    // Capture all calls immediately before any hooks can clear them
    // This prevents the global afterEach from clearing our call history
    routeCalls = {
      get: [...mockRouter.get.mock.calls],
      post: [...mockRouter.post.mock.calls],
      put: [...mockRouter.put.mock.calls],
      delete: [...mockRouter.delete.mock.calls],
    };
  });

  describe('Route Registration', () => {
    it('should register GET / route', () => {
      const getCalls = routeCalls.get;
      expect(getCalls.length).toBeGreaterThan(0);
      expect(getCalls.some(call => 
        call[0] === '/' && call[1] === mockControllers.getUsers
      )).toBe(true);
    });

    it('should register POST / route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.length).toBeGreaterThan(0);
      expect(postCalls.some(call => 
        call[0] === '/' && call[1] === mockControllers.createUser
      )).toBe(true);
    });

    it('should register POST /lock-actions route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.some(call => 
        call[0] === '/lock-actions' && call[1] === mockControllers.lockAction
      )).toBe(true);
    });

    it('should register POST /login route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.some(call => 
        call[0] === '/login' && call[1] === mockControllers.login
      )).toBe(true);
    });

    it('should register PUT /:email route with upload middleware', () => {
      const putCalls = routeCalls.put;
      expect(putCalls.some(call => 
        call[0] === '/:email' && 
        call[1] === mockUploadSingle && 
        call[2] === mockControllers.updateUser
      )).toBe(true);
    });

    it('should register DELETE /:email route', () => {
      const deleteCalls = routeCalls.delete;
      expect(deleteCalls.some(call => 
        call[0] === '/:email' && call[1] === mockControllers.deleteUser
      )).toBe(true);
    });

    it('should register POST /register route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.some(call => 
        call[0] === '/register' && call[1] === mockControllers.register
      )).toBe(true);
    });

    it('should register POST /join route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.some(call => 
        call[0] === '/join' && call[1] === mockControllers.join
      )).toBe(true);
    });

    it('should register POST /remove-code route', () => {
      const postCalls = routeCalls.post;
      expect(postCalls.some(call => 
        call[0] === '/remove-code' && call[1] === mockControllers.removeCode
      )).toBe(true);
    });

    it('should have registered all expected routes', () => {
      // Verify all routes were registered
      expect(routeCalls.get.length).toBe(1);
      expect(routeCalls.post.length).toBe(6); // /, /lock-actions, /login, /register, /join, /remove-code
      expect(routeCalls.put.length).toBe(1);
      expect(routeCalls.delete.length).toBe(1);
    });
  });

  describe('Route Export', () => {
    it('should export router', () => {
      expect(routes).toBe(mockRouter);
    });
  });
});
