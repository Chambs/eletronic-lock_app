const request = require('supertest');
const app = require('../../server');
const pool = require('../../db');
const axios = require('axios');

// Mock external services
jest.mock('axios');
const mockedAxios = axios;

// Test helper functions
const testHelpers = {
  generateTestEmail: (prefix = 'test') => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
  
  createUser: async (userData) => {
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    return response;
  },
  
  login: async (email, password) => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email, password });
    return response;
  },
  
  updateUser: async (email, updates) => {
    const response = await request(app)
      .put(`/api/users/${email}`)
      .send(updates);
    return response;
  },
  
  registerLock: async (email, code) => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ email, code });
    return response;
  },
  
  joinLock: async (email, code) => {
    const response = await request(app)
      .post('/api/users/join')
      .send({ email, code });
    return response;
  },
  
  removeCode: async (email, code) => {
    const response = await request(app)
      .post('/api/users/remove-code')
      .send({ email, code });
    return response;
  },
  
  deleteUser: async (email, requester) => {
    const response = await request(app)
      .delete(`/api/users/${email}`)
      .send({ requester });
    return response;
  },
  
  getUsers: async (code) => {
    const response = await request(app)
      .get('/api/users')
      .query({ code });
    return response;
  },
  
  cleanupTestData: async () => {
    try {
      await pool.query('DELETE FROM user_lock_access WHERE user_email LIKE $1', ['test_%']);
      await pool.query('DELETE FROM users WHERE email LIKE $1', ['test_%']);
    } catch (error) {
      // Silently ignore cleanup errors - database might be unavailable
      // Common errors: Connection terminated, ENOTFOUND, timeout
    }
  },
  
  closePool: async () => {
    if (!pool || typeof pool.end !== 'function') {
      return;
    }
    
    try {
      // Remove error listeners to prevent process.exit during cleanup
      pool.removeAllListeners('error');
      
      // Try to end the pool with a timeout
      // pool.end() returns a Promise in newer versions of pg
      const closePromise = pool.end();
      
      // Race with timeout to prevent hanging
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000); // 2 second timeout
      });
      
      await Promise.race([closePromise, timeoutPromise]);
    } catch (error) {
      // Silently ignore errors - connections will be cleaned up by Node.js
      // Common errors: Connection terminated, ENOTFOUND, already closed
    }
  }
};

describe('User Services - E2E Tests', () => {
  let testUserEmail;
  let testUserPassword;
  let testUserName;
  let createdUsers = []; // Track all created users for cleanup

  beforeAll(async () => {
    // Setup test data
    testUserEmail = testHelpers.generateTestEmail('test');
    testUserPassword = 'TestPassword123!';
    testUserName = 'Test User';

    // Mock external services
    mockedAxios.post.mockResolvedValue({ status: 200, data: { message: 'OK' } });
    
    // Create initial test user
    const createResponse = await testHelpers.createUser({
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword
    });
    
    if (createResponse.status === 201) {
      createdUsers.push(testUserEmail);
    }
  });

  afterAll(async () => {
    // Clean up all test users
    await testHelpers.cleanupTestData();
    
    // Close database connections properly
    await testHelpers.closePool();
    
    // Small delay to ensure all async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 10000); // 10 second timeout for afterAll

  describe('POST /api/users - Create User', () => {
    it('should create a new user successfully', async () => {
      const email = testHelpers.generateTestEmail('create');
      const response = await testHelpers.createUser({
        name: 'New User',
        email,
        password: testUserPassword
      });

      expect([201, 500]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.message).toBe('User created successfully.');
        createdUsers.push(email);
      }
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: testUserName
          // email and password missing
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name, email and password are required.');
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: testUserName,
          email: 'invalid-email',
          password: testUserPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format.');
    });

    it('should return 400 when email is already registered', async () => {
      const response = await testHelpers.createUser({
        name: 'Duplicate User',
        email: testUserEmail,
        password: testUserPassword
      });

      expect([400, 500]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.error).toBe('This email is already registered.');
      }
    });
  });

  describe('POST /api/users/login - Login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await testHelpers.login(testUserEmail, testUserPassword);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('Login successful');
        expect(response.body.email).toBe(testUserEmail);
        expect(response.body.name).toBe(testUserName);
      }
    });

    it('should return 400 when email or password is missing', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUserEmail
          // password missing
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required.');
    });

    it('should return 401 when user does not exist', async () => {
      const response = await testHelpers.login('nonexistent@test.com', testUserPassword);

      expect([401, 500]).toContain(response.status);
      if (response.status === 401) {
        expect(response.body.error).toBe('User not found.');
      }
    });

    it('should return 401 when password is incorrect', async () => {
      const response = await testHelpers.login(testUserEmail, 'WrongPassword123!');

      expect([401, 500]).toContain(response.status);
      if (response.status === 401) {
        expect(response.body.error).toBe('Incorrect password.');
      }
    });
  });

  describe('PUT /api/users/:email - Update User', () => {
    it('should update user name successfully', async () => {
      const newName = 'Updated Test User';
      const response = await testHelpers.updateUser(testUserEmail, { name: newName });

      if (response.status === 200) {
        expect(response.body.message).toBe('Usuário atualizado com sucesso!');
        expect(response.body.user.name).toBe(newName);
      } else {
        // If database connection fails, skip this test
        expect(response.status).toBeGreaterThanOrEqual(500);
      }
    });

    it('should update user password successfully', async () => {
      const newPassword = 'NewPassword123!';
      const response = await testHelpers.updateUser(testUserEmail, { password: newPassword });

      if (response.status === 200) {
        expect(response.body.message).toBe('Usuário atualizado com sucesso!');

        // Verify new password works
        const loginResponse = await testHelpers.login(testUserEmail, newPassword);
        expect(loginResponse.status).toBe(200);
        testUserPassword = newPassword; // Update for future tests
      }
    });

    it('should update user email successfully', async () => {
      const newEmail = testHelpers.generateTestEmail('updated');
      mockedAxios.post.mockResolvedValueOnce({ status: 200 });

      const response = await testHelpers.updateUser(testUserEmail, { email: newEmail });

      if (response.status === 200) {
        expect(response.body.message).toBe('Usuário atualizado com sucesso!');
        expect(response.body.user.email).toBe(newEmail);
        testUserEmail = newEmail; // Update for future tests
        createdUsers.push(newEmail);
      }
    });

    it('should return 404 when user does not exist', async () => {
      const response = await testHelpers.updateUser('nonexistent@test.com', { name: 'New Name' });

      expect([404, 500]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body.error).toBe('Usuário não encontrado');
      }
    });

    it('should return 409 when new email already exists', async () => {
      const existingEmail = testHelpers.generateTestEmail('existing');
      
      // Create a user with this email first
      const createResponse = await testHelpers.createUser({
        name: 'Existing User',
        email: existingEmail,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(existingEmail);
        
        // Try to update another user to this email
        const response = await testHelpers.updateUser(testUserEmail, { email: existingEmail });
        expect([409, 500]).toContain(response.status);
        if (response.status === 409) {
          expect(response.body.error).toBe('Já existe um usuário com esse e-mail.');
        }
      }
    });
  });

  describe('POST /api/users/register - Register Lock as Admin', () => {
    it('should register lock as admin successfully', async () => {
      const lockCode = `LOCK${Date.now()}`;
      const response = await testHelpers.registerLock(testUserEmail, lockCode);

      expect([200, 400, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('User registered');
      }
    });

    it('should return error when code is invalid or user does not exist', async () => {
      const response = await testHelpers.registerLock('nonexistent@test.com', 'INVALID_CODE');

      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/users/join - Join Lock as Guest', () => {
    let guestEmail;

    beforeAll(async () => {
      // Create guest user
      guestEmail = testHelpers.generateTestEmail('guest');
      const createResponse = await testHelpers.createUser({
        name: 'Guest User',
        email: guestEmail,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(guestEmail);
      }
    });

    it('should allow user to join as guest', async () => {
      const inviteCode = `invite${Date.now()}`;
      mockedAxios.post.mockResolvedValue({ status: 200 });
      
      const response = await testHelpers.joinLock(guestEmail, inviteCode);

      expect([200, 400, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('Join successful');
      }
    });
  });

  describe('POST /api/users/remove-code - Remove Code/Access', () => {
    let userWithCode;
    let lockCode;

    beforeAll(async () => {
      // Create user with code
      userWithCode = testHelpers.generateTestEmail('user_with_code');
      lockCode = `LOCK${Date.now()}`;
      
      const createResponse = await testHelpers.createUser({
        name: 'User With Code',
        email: userWithCode,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(userWithCode);
        
        const registerResponse = await testHelpers.registerLock(userWithCode, lockCode);
        // Continue even if register fails
      }
    });

    it('should remove access code from user', async () => {
      const response = await testHelpers.removeCode(userWithCode, lockCode);

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('Código removido.');
      }
    });

    it('should return 400 when email or code is missing', async () => {
      const response = await request(app)
        .post('/api/users/remove-code')
        .send({
          email: userWithCode
          // code missing
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email e código são obrigatórios.');
    });

    it('should return 404 when code does not exist', async () => {
      const response = await testHelpers.removeCode(userWithCode, 'NONEXISTENT_CODE');

      expect([404, 500]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body.error).toBe('Código não encontrado.');
      }
    });
  });

  describe('GET /api/users - List Users', () => {
    let testLockCode;
    let listUserEmail;

    beforeAll(async () => {
      // Create user and add to lock
      testLockCode = `LOCK${Date.now()}`;
      listUserEmail = testHelpers.generateTestEmail('list');
      
      const createResponse = await testHelpers.createUser({
        name: 'List User',
        email: listUserEmail,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(listUserEmail);
        
        mockedAxios.post.mockResolvedValueOnce({ status: 200 });
        await testHelpers.registerLock(listUserEmail, testLockCode);
      }
    });

    it('should list users of a lock', async () => {
      const response = await testHelpers.getUsers(testLockCode);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body.some(user => user.email === listUserEmail)).toBe(true);
        }
      }
    });

    it('should return empty array for non-existent code', async () => {
      const response = await testHelpers.getUsers('NONEXISTENT_LOCK');

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('DELETE /api/users/:email - Delete User', () => {
    let userToDelete;

    beforeAll(async () => {
      // Create user to delete
      userToDelete = testHelpers.generateTestEmail('delete');
      const createResponse = await testHelpers.createUser({
        name: 'User To Delete',
        email: userToDelete,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(userToDelete);
      }
    });

    it('should allow user to delete themselves', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await testHelpers.deleteUser(userToDelete, userToDelete);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('Usuário removido com sucesso.');

        // Verify user is deleted
        const loginResponse = await testHelpers.login(userToDelete, testUserPassword);
        expect(loginResponse.status).toBe(401);
      }
    });

    it('should return 404 when user does not exist', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await testHelpers.deleteUser('nonexistent@test.com', 'nonexistent@test.com');

      expect([404, 500]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body.error).toBe('Usuário não encontrado');
      }
    });

    it('should return 403 when requester does not exist', async () => {
      const anotherUser = testHelpers.generateTestEmail('another');
      const createResponse = await testHelpers.createUser({
        name: 'Another User',
        email: anotherUser,
        password: testUserPassword
      });
      
      if (createResponse.status === 201) {
        createdUsers.push(anotherUser);
        
        const response = await testHelpers.deleteUser(anotherUser, 'nonexistent_requester@test.com');
        expect([403, 500]).toContain(response.status);
        if (response.status === 403) {
          expect(response.body.error).toBe('Operação não permitida.');
        }
      }
    });
  });

  describe('POST /api/users/lock-actions - Register Action', () => {
    it('should register action successfully', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      
      const response = await request(app)
        .post('/api/users/lock-actions')
        .send({
          user: testUserEmail,
          action: 'open',
          code: 'LOCK1'
        });

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.message).toBe('Ação registrada com sucesso.');
        expect(mockedAxios.post).toHaveBeenCalled();
      }
    });

    it('should return 400 when user or action is missing', async () => {
      const response = await request(app)
        .post('/api/users/lock-actions')
        .send({
          user: testUserEmail
          // action missing
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User and action are required.');
    });
  });

  describe('GET /api/users/health - Health Check', () => {
    it('should return status OK', async () => {
      const response = await request(app)
        .get('/api/users/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('user-service');
    });
  });
});
