const request = require('supertest');

describe('Server - Unit Tests', () => {
  let app;
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock db pool
    jest.mock('../../db', () => ({
      connect: jest.fn().mockResolvedValue({
        release: jest.fn()
      })
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Health Check Endpoint', () => {
    beforeEach(() => {
      // Mock database connection to avoid actual connection during tests
      jest.doMock('../../db', () => ({
        connect: jest.fn().mockResolvedValue({
          release: jest.fn()
        })
      }));
      
      app = require('../../server');
    });

    it('should return 200 status code', async () => {
      const response = await request(app)
        .get('/api/users/health');

      expect(response.status).toBe(200);
    });

    it('should return correct health check response', async () => {
      const response = await request(app)
        .get('/api/users/health');

      expect(response.body).toEqual({
        status: 'OK',
        service: 'user-service'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/users/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Server Configuration', () => {
    beforeEach(() => {
      jest.doMock('../../db', () => ({
        connect: jest.fn().mockResolvedValue({
          release: jest.fn()
        })
      }));
      
      app = require('../../server');
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/users/health')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET');

      // CORS should allow the request
      expect(response.status).toBeLessThan(500);
    });

    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@test.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).not.toBe(415); // Not Unsupported Media Type
    });

    it('should mount routes on /api/users prefix', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ code: 'LOCK1' });

      // Should not return 404 if route is properly mounted
      expect(response.status).not.toBe(404);
    });

    it('should serve static files from /api/uploads', async () => {
      // This tests that the static middleware is configured
      // Actual file serving depends on file existence
      const response = await request(app)
        .get('/api/uploads/nonexistent.jpg');

      // Should not return 500 (server error), might return 404 if file doesn't exist
      expect(response.status).not.toBe(500);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.doMock('../../db', () => ({
        connect: jest.fn().mockResolvedValue({
          release: jest.fn()
        })
      }));
      
      app = require('../../server');
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('invalid json {');

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Server Export', () => {
    it('should export app for testing', () => {
      jest.doMock('../../db', () => ({
        connect: jest.fn().mockResolvedValue({
          release: jest.fn()
        })
      }));
      
      const server = require('../../server');
      
      expect(server).toBeDefined();
      expect(typeof server.listen).toBe('function');
    });
  });
});

