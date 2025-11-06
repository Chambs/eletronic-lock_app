const userRepository = require('../../userRepository');
const pool = require('../../db');

// Mock the database pool
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

describe('UserRepository - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        profile_image: null
      };

      pool.query.mockResolvedValue({
        rows: [mockUser]
      });

      const result = await userRepository.findByEmail('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      pool.query.mockResolvedValue({
        rows: [{ exists: true }]
      });

      const result = await userRepository.emailExists('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
        ['test@example.com']
      );
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      pool.query.mockResolvedValue({
        rows: [{ exists: false }]
      });

      const result = await userRepository.emailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.emailExists('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        profile_image: null
      };

      const mockCreatedUser = {
        id: 1,
        ...userData
      };

      pool.query.mockResolvedValue({
        rows: [mockCreatedUser]
      });

      const result = await userRepository.createUser(userData);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash, profile_image) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Test User', 'test@example.com', 'hashed_password', null]
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password'
      })).rejects.toThrow('Database error');
    });
  });

  describe('updateUser', () => {
    it('should update user with provided fields', async () => {
      const updates = {
        name: 'Updated Name',
        profile_image: 'new_image.jpg'
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated Name',
        profile_image: 'new_image.jpg'
      };

      pool.query.mockResolvedValue({
        rows: [mockUpdatedUser]
      });

      const result = await userRepository.updateUser('test@example.com', updates);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining(['Updated Name', 'new_image.jpg', 'test@example.com'])
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error when no fields to update', async () => {
      await expect(userRepository.updateUser('test@example.com', {})).rejects.toThrow('No fields to update');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.updateUser('test@example.com', { name: 'New Name' })).rejects.toThrow('Database error');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockDeletedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      pool.query.mockResolvedValue({
        rows: [mockDeletedUser]
      });

      const result = await userRepository.deleteUser('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE email = $1 RETURNING *',
        ['test@example.com']
      );
      expect(result).toEqual(mockDeletedUser);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.deleteUser('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('updateEmail', () => {
    it('should update email in users and user_lock_access tables', async () => {
      pool.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // UPDATE users
        .mockResolvedValueOnce({}) // UPDATE user_lock_access
        .mockResolvedValueOnce({}); // COMMIT

      const result = await userRepository.updateEmail('old@example.com', 'new@example.com');

      expect(pool.query).toHaveBeenCalledWith('BEGIN');
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET email = $1 WHERE email =$2',
        ['new@example.com', 'old@example.com']
      );
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE user_lock_access SET user_email = $1 WHERE user_email = $2',
        ['new@example.com', 'old@example.com']
      );
      expect(pool.query).toHaveBeenCalledWith('COMMIT');
      expect(result).toBe(true);
    });

    it('should rollback on error', async () => {
      pool.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Database error')); // UPDATE users fails

      await expect(userRepository.updateEmail('old@example.com', 'new@example.com')).rejects.toThrow('Database error');

      expect(pool.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('findUsersByCode', () => {
    it('should return users for a given lock code', async () => {
      const mockUsers = [
        { name: 'User 1', email: 'user1@test.com', profile_image: null, is_admin: true },
        { name: 'User 2', email: 'user2@test.com', profile_image: null, is_admin: false }
      ];

      pool.query.mockResolvedValue({
        rows: mockUsers
      });

      const result = await userRepository.findUsersByCode('LOCK1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.name, u.email, u.profile_image'),
        ['LOCK1']
      );
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const result = await userRepository.findUsersByCode('NONEXISTENT');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findUsersByCode('LOCK1')).rejects.toThrow('Database error');
    });
  });

  describe('addAdminCodeToUser', () => {
    it('should add admin code to user successfully', async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 1, user_email: 'test@example.com', lock_code: 'LOCK1', is_admin: true }]
      });

      const result = await userRepository.addAdminCodeToUser('test@example.com', 'LOCK1');

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO user_lock_access (user_email, lock_code, is_admin) VALUES ($1, $2, true) ON CONFLICT DO NOTHING RETURNING *',
        ['test@example.com', 'LOCK1']
      );
      expect(result).toBe(true);
    });

    it('should return false when conflict occurs', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const result = await userRepository.addAdminCodeToUser('test@example.com', 'LOCK1');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.addAdminCodeToUser('test@example.com', 'LOCK1')).rejects.toThrow('Database error');
    });
  });

  describe('addNonAdminCodeToUser', () => {
    it('should add non-admin code to user successfully', async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 1, user_email: 'test@example.com', lock_code: 'invite1', is_admin: false }]
      });

      const result = await userRepository.addNonAdminCodeToUser('test@example.com', 'invite1');

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO user_lock_access (user_email, lock_code, is_admin) VALUES ($1, $2, false) ON CONFLICT DO NOTHING RETURNING *',
        ['test@example.com', 'invite1']
      );
      expect(result).toBe(true);
    });

    it('should return false when conflict occurs', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const result = await userRepository.addNonAdminCodeToUser('test@example.com', 'invite1');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.addNonAdminCodeToUser('test@example.com', 'invite1')).rejects.toThrow('Database error');
    });
  });

  describe('removeCodeFromUser', () => {
    it('should remove code from user successfully', async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 1, user_email: 'test@example.com', lock_code: 'LOCK1' }]
      });

      const result = await userRepository.removeCodeFromUser('test@example.com', 'LOCK1');

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM user_lock_access WHERE user_email = $1 AND lock_code = $2 RETURNING *',
        ['test@example.com', 'LOCK1']
      );
      expect(result).toBe(true);
    });

    it('should return false when code not found', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const result = await userRepository.removeCodeFromUser('test@example.com', 'NONEXISTENT');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.removeCodeFromUser('test@example.com', 'LOCK1')).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' }
      ];

      pool.query.mockResolvedValue({
        rows: mockUsers
      });

      const result = await userRepository.getAll();

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC');
      expect(result).toEqual(mockUsers);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.getAll()).rejects.toThrow('Database error');
    });
  });
});

