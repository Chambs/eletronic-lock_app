const request = require('supertest');

describe('Event Bus - Unit Tests', () => {
  let app;

  beforeEach(() => {
    // Clear module cache to get fresh instance
    jest.resetModules();
    app = require('../../eventBus');
  });

  describe('Server Configuration', () => {
    it('should export express app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have JSON middleware configured', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} })
        .set('Content-Type', 'application/json');

      expect(response.status).not.toBe(415); // Not Unsupported Media Type
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/events/join')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).not.toBe(403);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 status code', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.status).toBe(200);
    });

    it('should return correct health check response', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.body).toEqual({
        status: 'OK',
        service: 'event-bus'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should be accessible via GET method', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.status).toBe(200);
    });
  });

  describe('Event Endpoint - POST /api/events/join', () => {
    it('should accept POST requests', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} });

      expect(response.status).toBe(200);
    });

    it('should return success response', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} });

      expect(response.body).toEqual({ msg: 'ok' });
    });

    it('should accept JSON payload', async () => {
      const event = {
        type: 'LOCK_ACTION',
        data: { user: 'test@test.com', action: 'opened', code: 'LOCK1' }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
    });

    it('should handle empty event data', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({});

      expect(response.status).toBe(200);
    });

    it('should handle events without type', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ data: { some: 'data' } });

      expect(response.status).toBe(200);
    });

    it('should handle events without data', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST_EVENT' });

      expect(response.status).toBe(200);
    });
  });

  describe('HTTP Methods', () => {
    it('should not accept GET on /api/events/join', async () => {
      const response = await request(app)
        .get('/api/events/join');

      expect(response.status).toBe(404);
    });

    it('should not accept PUT on /api/events/join', async () => {
      const response = await request(app)
        .put('/api/events/join')
        .send({ type: 'TEST', data: {} });

      expect(response.status).toBe(404);
    });

    it('should not accept DELETE on /api/events/join', async () => {
      const response = await request(app)
        .delete('/api/events/join');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should return 404 for invalid endpoints', async () => {
      const response = await request(app)
        .post('/api/events/invalid')
        .send({ type: 'TEST', data: {} });

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .set('Content-Type', 'application/json')
        .send('invalid json {');

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Response Format', () => {
    it('should always return JSON response', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} });

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return consistent response structure', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} });

      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toBe('ok');
    });
  });

  describe('Event Types Support', () => {
    const eventTypes = [
      'LOCK_ACTION',
      'ADMIN_REMOVED',
      'USER_REMOVED',
      'USER_JOINED',
      'EMAIL_UPDATED',
      'LOCK_REGISTERED',
      'CUSTOM_EVENT'
    ];

    eventTypes.forEach(eventType => {
      it(`should accept ${eventType} event type`, async () => {
        const response = await request(app)
          .post('/api/events/join')
          .send({ type: eventType, data: {} });

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        request(app)
          .post('/api/events/join')
          .send({ type: 'TEST', data: { index: i } })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('ok');
      });
    });
  });

  describe('Request Headers', () => {
    it('should accept requests with various content types', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
    });

    it('should handle requests with custom headers', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({ type: 'TEST', data: {} })
        .set('X-Custom-Header', 'test-value');

      expect(response.status).toBe(200);
    });
  });
});

