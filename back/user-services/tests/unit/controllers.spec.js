const axios = require('axios');
const bcrypt = require('bcrypt');
const userRepository = require('../../userRepository');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  lockAction,
  login,
  register,
  join,
  removeCode
} = require('../../controllers');

// Mock dependencies
jest.mock('axios');
jest.mock('bcrypt');
jest.mock('../../userRepository');

describe('Controllers - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      query: {},
      file: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });


  describe('getUsers', () => {
    it('should return users by code', async () => {
      const mockUsers = [
        { name: 'User 1', email: 'user1@test.com', profile_image: null, is_admin: true },
        { name: 'User 2', email: 'user2@test.com', profile_image: null, is_admin: false }
      ];
      
      userRepository.findUsersByCode.mockResolvedValue(mockUsers);
      req.query.code = 'LOCK1';

      await getUsers(req, res);

      expect(userRepository.findUsersByCode).toHaveBeenCalledWith('LOCK1');
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      userRepository.findUsersByCode.mockRejectedValue(new Error('Database error'));
      req.query.code = 'LOCK1';

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.emailExists.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue('hashed_password');
      userRepository.createUser.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      });

      await createUser(req, res);

      expect(userRepository.emailExists).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        profile_image: null
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully.' });
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { name: 'Test User' };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name, email and password are required.' });
    });

    it('should return 400 for invalid email', async () => {
      req.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format.' });
    });

    it('should return 400 when email already exists', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.emailExists.mockResolvedValue(true);

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'This email is already registered.' });
    });

    it('should handle errors', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.emailExists.mockRejectedValue(new Error('Database error'));

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        profile_image: null
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await login(req, res);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        name: 'Test User',
        email: 'test@example.com',
        profileImage: null
      });
    });

    it('should return 400 when email or password is missing', async () => {
      req.body = { email: 'test@example.com' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required.' });
    });

    it('should return 401 when user not found', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return 401 when password is incorrect', async () => {
      const mockUser = {
        email: 'test@example.com',
        password_hash: 'hashed_password'
      };

      req.body = {
        email: 'test@example.com',
        password: 'wrong_password'
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect password.' });
    });

    it('should handle errors', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateUser', () => {
    it('should update user name', async () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Old Name',
        profile_image: null
      };

      req.params.email = 'test@example.com';
      req.body = { name: 'New Name' };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.updateUser.mockResolvedValue({
        ...mockUser,
        name: 'New Name'
      });

      await updateUser(req, res);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.updateUser).toHaveBeenCalledWith('test@example.com', { name: 'New Name' });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário atualizado com sucesso!',
        user: expect.objectContaining({ name: 'New Name' })
      });
    });

    it('should update user password', async () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User'
      };

      req.params.email = 'test@example.com';
      req.body = { password: 'newpassword123' };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('new_hashed_password');
      userRepository.updateUser.mockResolvedValue(mockUser);

      await updateUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(userRepository.updateUser).toHaveBeenCalledWith('test@example.com', {
        password_hash: 'new_hashed_password'
      });
    });

    it('should update user email', async () => {
      const mockUser = {
        email: 'old@example.com',
        name: 'Test User'
      };

      req.params.email = 'old@example.com';
      req.body = { email: 'new@example.com' };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.updateEmail.mockResolvedValue(true);
      axios.post.mockResolvedValue({ status: 200 });

      await updateUser(req, res);

      expect(userRepository.updateEmail).toHaveBeenCalledWith('old@example.com', 'new@example.com');
      expect(axios.post).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      req.params.email = 'nonexistent@example.com';
      req.body = { name: 'New Name' };

      userRepository.findByEmail.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('should return 409 when new email already exists', async () => {
      const mockUser = {
        email: 'old@example.com',
        name: 'Test User'
      };

      req.params.email = 'old@example.com';
      req.body = { email: 'existing@example.com' };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.emailExists.mockResolvedValue(true);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Já existe um usuário com esse e-mail.' });
    });

    it('should handle errors', async () => {
      req.params.email = 'test@example.com';
      req.body = { name: 'New Name' };

      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user when requester is admin', async () => {
      const mockUser = {
        email: 'user@example.com',
        name: 'Test User'
      };

      req.params.email = 'user@example.com';
      req.body.requester = 'admin@example.com';

      userRepository.findByEmail
        .mockResolvedValueOnce(mockUser) // userToDelete
        .mockResolvedValueOnce({ email: 'admin@example.com' }); // requestingUser

      userRepository.findUsersByCode.mockResolvedValue([
        { user_email: 'admin@example.com', is_admin: true }
      ]);

      userRepository.deleteUser.mockResolvedValue(mockUser);
      axios.post.mockResolvedValue({ status: 200 });

      await deleteUser(req, res);

      expect(userRepository.deleteUser).toHaveBeenCalledWith('user@example.com');
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário removido com sucesso.' });
    });

    it('should delete user when requester is self', async () => {
      const mockUser = {
        email: 'user@example.com',
        name: 'Test User'
      };

      req.params.email = 'user@example.com';
      req.body.requester = 'user@example.com';

      userRepository.findByEmail
        .mockResolvedValueOnce(mockUser) // userToDelete
        .mockResolvedValueOnce(mockUser); // requestingUser

      userRepository.findUsersByCode.mockResolvedValue([]);

      userRepository.deleteUser.mockResolvedValue(mockUser);
      axios.post.mockResolvedValue({ status: 200 });

      await deleteUser(req, res);

      expect(userRepository.deleteUser).toHaveBeenCalledWith('user@example.com');
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário removido com sucesso.' });
    });

    it('should return 404 when user not found', async () => {
      req.params.email = 'nonexistent@example.com';
      req.body.requester = 'admin@example.com';

      userRepository.findByEmail.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('should return 403 when requester is not admin or self', async () => {
      const mockUser = {
        email: 'user@example.com',
        name: 'Test User'
      };

      req.params.email = 'user@example.com';
      req.body.requester = 'other@example.com';

      userRepository.findByEmail
        .mockResolvedValueOnce(mockUser) // userToDelete
        .mockResolvedValueOnce({ email: 'other@example.com' }); // requestingUser

      userRepository.findUsersByCode.mockResolvedValue([]);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Você não tem permissão para excluir este usuário.' });
    });

    it('should handle errors', async () => {
      req.params.email = 'user@example.com';
      req.body.requester = 'user@example.com';

      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('lockAction', () => {
    it('should log action successfully', async () => {
      req.body = {
        user: 'user@example.com',
        action: 'open',
        code: 'LOCK1'
      };

      axios.post.mockResolvedValue({ status: 200 });

      await lockAction(req, res);

      expect(axios.post).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ação registrada com sucesso.' });
    });

    it('should return 400 when user or action is missing', async () => {
      req.body = { user: 'user@example.com' };

      await lockAction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User and action are required.' });
    });

    it('should handle errors', async () => {
      req.body = {
        user: 'user@example.com',
        action: 'open',
        code: 'LOCK1'
      };

      axios.post.mockRejectedValue(new Error('Network error'));

      await lockAction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao registrar ação no LogService.' });
    });
  });

  describe('register', () => {
    it('should register user with code successfully', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.addAdminCodeToUser.mockResolvedValue(true);

      await register(req, res);

      expect(userRepository.addAdminCodeToUser).toHaveBeenCalledWith('user@example.com', 'LOCK1');
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered' });
    });

    it('should return 400 when registration fails', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.addAdminCodeToUser.mockResolvedValue(false);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to register user' });
    });

    it('should handle errors', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.addAdminCodeToUser.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('join', () => {
    it('should join user with code successfully', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'invite1'
      };

      userRepository.addNonAdminCodeToUser.mockResolvedValue(true);

      await join(req, res);

      expect(userRepository.addNonAdminCodeToUser).toHaveBeenCalledWith('user@example.com', 'invite1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Join successful' });
    });

    it('should return 400 when join fails', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'invite1'
      };

      userRepository.addNonAdminCodeToUser.mockResolvedValue(false);

      await join(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to join lock' });
    });

    it('should handle errors', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'invite1'
      };

      userRepository.addNonAdminCodeToUser.mockRejectedValue(new Error('Database error'));

      await join(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('removeCode', () => {
    it('should remove code successfully', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.removeCodeFromUser.mockResolvedValue(true);

      await removeCode(req, res);

      expect(userRepository.removeCodeFromUser).toHaveBeenCalledWith('user@example.com', 'LOCK1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Código removido.' });
    });

    it('should return 400 when email or code is missing', async () => {
      req.body = { email: 'user@example.com' };

      await removeCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email e código são obrigatórios.' });
    });

    it('should return 404 when code not found', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.removeCodeFromUser.mockResolvedValue(false);

      await removeCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Código não encontrado.' });
    });

    it('should handle errors', async () => {
      req.body = {
        email: 'user@example.com',
        code: 'LOCK1'
      };

      userRepository.removeCodeFromUser.mockRejectedValue(new Error('Database error'));

      await removeCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

