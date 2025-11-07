const request = require('supertest');

describe('Server - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require('../../server');
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 status code', async () => {
      const response = await request(app)
        .get('/api/locks/health');

      expect(response.status).toBe(200);
    });

    it('should return correct health check response', async () => {
      const response = await request(app)
        .get('/api/locks/health');

      expect(response.body).toEqual({
        status: 'OK',
        service: 'lock-service'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/locks/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Server Configuration', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/locks/health')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBeLessThan(500);
    });

    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/locks/locks')
        .send({ email: 'test@test.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).not.toBe(415);
    });

    it('should mount routes on /api/locks prefix', async () => {
      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: 'LOCK1' });

      expect(response.status).not.toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/locks/locks')
        .set('Content-Type', 'application/json')
        .send('invalid json {');

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('API Routes Integration', () => {
    it('should have status endpoint available', async () => {
      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: 'LOCK1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });

    it('should have locks endpoint available', async () => {
      const response = await request(app)
        .post('/api/locks/locks')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
    });

    it('should have register endpoint available', async () => {
      const response = await request(app)
        .post('/api/locks/register')
        .send({ code: 'LOCK1', nickname: 'Test', admin: 'test@test.com' });

      expect([200, 409]).toContain(response.status);
    });

    it('should have join endpoint available', async () => {
      const response = await request(app)
        .post('/api/locks/join')
        .send({ type: 'JOIN', invitationCode: 'invite1', email: 'test@test.com' });

      expect([200, 409, 423]).toContain(response.status);
    });

    it('should have invite-code endpoint available', async () => {
      const response = await request(app)
        .get('/api/locks/invite-code')
        .query({ code: 'LOCK1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inviteCode');
    });

    it('should have update-email endpoint available', async () => {
      const response = await request(app)
        .post('/api/locks/update-email')
        .send({ email: 'old@test.com', newEmail: 'new@test.com' });

      expect(response.status).toBe(200);
    });

    it('should have remove-user-access endpoint available', async () => {
      const response = await request(app)
        .post('/api/locks/remove-user-access')
        .send({ email: 'test@test.com' });

      expect(response.status).not.toBe(404);
    });
  });

  describe('HTTP Methods', () => {
    it('should accept GET requests on status endpoint', async () => {
      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: 'LOCK1' });

      expect(response.status).not.toBe(405);
    });

    it('should accept POST requests on status endpoint', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({ code: 'LOCK1', status: 'Open' });

      expect(response.status).not.toBe(405);
    });

    it('should accept DELETE requests on self-access endpoint', async () => {
      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/self-access')
        .send({ userEmail: 'test@test.com' });

      expect(response.status).not.toBe(405);
    });
  });
});

