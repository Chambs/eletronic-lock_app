const axios = require('axios');
const {
  findLocksByEmail,
  getStatus,
  setStatus,
  isLockCodeExists,
  hasNoAdminForLock,
  assignAdminToLock,
  isInviteCodeExists,
  isEmailRegistered,
  addNonAdminUser,
  getRegistrationCodeByInviteCode,
  getInviteCodeByRegistrationCode,
  hasAdmin,
  updateEmail,
  removeUserAccess,
  removeInvitedUser,
  removeOwnAccess,
  findLockByRegistrationCode,
  resetLocks
} = require('../../controllers');

// Mock axios
jest.mock('axios');

describe('Controllers - Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    axios.post.mockReset();
  });

  afterEach(() => {
    // Reset locks to initial state between tests
    resetLocks();
  });

  describe('findLocksByEmail', () => {
    it('should return empty array when email has no locks', () => {
      const result = findLocksByEmail('nonexistent@test.com');
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return locks where user is admin', () => {
      // First assign admin to a lock
      assignAdminToLock('LOCK1', 'admin@test.com', 'Test Lock 1');
      
      const result = findLocksByEmail('admin@test.com');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('lockName', 'Test Lock 1');
      expect(result[0]).toHaveProperty('registrationCode', 'LOCK1');
      expect(result[0]).toHaveProperty('isAdmin', true);
    });

    it('should return locks where user is non-admin guest', () => {
      // Setup: assign admin and add guest
      assignAdminToLock('LOCK2', 'admin@test.com', 'Test Lock 2');
      addNonAdminUser('invite2', 'guest@test.com');
      
      const result = findLocksByEmail('guest@test.com');
      
      expect(result.length).toBeGreaterThan(0);
      const guestLock = result.find(lock => lock.registrationCode === 'LOCK2');
      expect(guestLock).toBeDefined();
      expect(guestLock.isAdmin).toBe(false);
    });

    it('should return both admin and guest locks for same email', () => {
      const email = 'multiuser@test.com';
      assignAdminToLock('LOCK3', email, 'Admin Lock');
      assignAdminToLock('LOCK4', 'other@test.com', 'Other Lock');
      addNonAdminUser('invite4', email);
      
      const result = findLocksByEmail(email);
      
      expect(result.length).toBe(2);
      const adminLocks = result.filter(lock => lock.isAdmin);
      const guestLocks = result.filter(lock => !lock.isAdmin);
      expect(adminLocks.length).toBe(1);
      expect(guestLocks.length).toBe(1);
    });
  });

  describe('getStatus', () => {
    it('should return "Closed" for default lock status', () => {
      const status = getStatus('LOCK1');
      expect(status).toBe('Closed');
    });

    it('should return correct status after setStatus', () => {
      setStatus('LOCK1', 'Open');
      const status = getStatus('LOCK1');
      expect(status).toBe('Open');
      
      // Reset
      setStatus('LOCK1', 'Closed');
    });

    it('should return "Fechadura não encontrada" for invalid code', () => {
      const status = getStatus('INVALID_CODE');
      expect(status).toBe('Fechadura não encontrada');
    });
  });

  describe('setStatus', () => {
    it('should update lock status to Open', () => {
      const result = setStatus('LOCK1', 'Open');
      expect(result).toContain('atualizado para: Open');
      expect(getStatus('LOCK1')).toBe('Open');
      
      // Reset
      setStatus('LOCK1', 'Closed');
    });

    it('should update lock status to Closed', () => {
      setStatus('LOCK1', 'Open');
      const result = setStatus('LOCK1', 'Closed');
      expect(result).toContain('atualizado para: Closed');
      expect(getStatus('LOCK1')).toBe('Closed');
    });

    it('should return error message for invalid lock code', () => {
      const result = setStatus('INVALID_CODE', 'Open');
      expect(result).toBe('Fechadura não encontrada');
    });
  });

  describe('isLockCodeExists', () => {
    it('should return true for existing lock codes', () => {
      expect(isLockCodeExists('LOCK1')).toBe(true);
      expect(isLockCodeExists('LOCK2')).toBe(true);
      expect(isLockCodeExists('LOCK3')).toBe(true);
      expect(isLockCodeExists('LOCK4')).toBe(true);
      expect(isLockCodeExists('LOCK5')).toBe(true);
    });

    it('should return false for non-existing lock codes', () => {
      expect(isLockCodeExists('LOCK99')).toBe(false);
      expect(isLockCodeExists('INVALID')).toBe(false);
      expect(isLockCodeExists('')).toBe(false);
    });
  });

  describe('hasNoAdminForLock', () => {
    it('should return true for lock without admin', () => {
      const result = hasNoAdminForLock('LOCK5');
      expect(result).toBe(true);
    });

    it('should return false for lock with admin', () => {
      assignAdminToLock('LOCK1', 'admin@test.com', 'Test Lock');
      const result = hasNoAdminForLock('LOCK1');
      expect(result).toBe(false);
    });

    it('should return false for non-existing lock', () => {
      const result = hasNoAdminForLock('INVALID_CODE');
      expect(result).toBe(false);
    });
  });

  describe('assignAdminToLock', () => {
    it('should assign admin to lock successfully', () => {
      const result = assignAdminToLock('LOCK5', 'newadmin@test.com', 'New Lock');
      expect(result).toBe(true);
      
      const locks = findLocksByEmail('newadmin@test.com');
      expect(locks.some(lock => lock.registrationCode === 'LOCK5')).toBe(true);
    });

    it('should update lock name when assigning admin', () => {
      assignAdminToLock('LOCK4', 'admin4@test.com', 'Lock Four');
      const lock = findLockByRegistrationCode('LOCK4');
      expect(lock.lockName).toBe('Lock Four');
      expect(lock.adminEmail).toBe('admin4@test.com');
    });

    it('should return false for invalid lock code', () => {
      const result = assignAdminToLock('INVALID_CODE', 'admin@test.com', 'Test');
      expect(result).toBe(false);
    });
  });

  describe('isInviteCodeExists', () => {
    it('should return true for existing invite codes', () => {
      expect(isInviteCodeExists('invite1')).toBe(true);
      expect(isInviteCodeExists('invite2')).toBe(true);
      expect(isInviteCodeExists('invite3')).toBe(true);
    });

    it('should return false for non-existing invite codes', () => {
      expect(isInviteCodeExists('invalid_invite')).toBe(false);
      expect(isInviteCodeExists('')).toBe(false);
    });
  });

  describe('isEmailRegistered', () => {
    beforeEach(() => {
      // Setup a lock with admin and guest
      assignAdminToLock('LOCK3', 'admin3@test.com', 'Lock 3');
      addNonAdminUser('invite3', 'guest3@test.com');
    });

    it('should return true when email is registered as admin', () => {
      const result = isEmailRegistered('invite3', 'admin3@test.com');
      expect(result).toBe(true);
    });

    it('should return true when email is registered as guest', () => {
      const result = isEmailRegistered('invite3', 'guest3@test.com');
      expect(result).toBe(true);
    });

    it('should return false when email is not registered', () => {
      const result = isEmailRegistered('invite3', 'notregistered@test.com');
      expect(result).toBe(false);
    });
  });

  describe('addNonAdminUser', () => {
    beforeEach(() => {
      assignAdminToLock('LOCK2', 'admin@test.com', 'Test Lock 2');
    });

    it('should add non-admin user successfully', () => {
      const result = addNonAdminUser('invite2', 'newguest@test.com');
      expect(result).toBe(true);
      
      const isRegistered = isEmailRegistered('invite2', 'newguest@test.com');
      expect(isRegistered).toBe(true);
    });

    it('should allow multiple guests to be added', () => {
      addNonAdminUser('invite2', 'guest1@test.com');
      addNonAdminUser('invite2', 'guest2@test.com');
      
      expect(isEmailRegistered('invite2', 'guest1@test.com')).toBe(true);
      expect(isEmailRegistered('invite2', 'guest2@test.com')).toBe(true);
    });
  });

  describe('getRegistrationCodeByInviteCode', () => {
    it('should return correct registration code for invite code', () => {
      expect(getRegistrationCodeByInviteCode('invite1')).toBe('LOCK1');
      expect(getRegistrationCodeByInviteCode('invite2')).toBe('LOCK2');
      expect(getRegistrationCodeByInviteCode('invite3')).toBe('LOCK3');
    });

    it('should return null for invalid invite code', () => {
      const result = getRegistrationCodeByInviteCode('invalid_invite');
      expect(result).toBeNull();
    });
  });

  describe('getInviteCodeByRegistrationCode', () => {
    it('should return correct invite code for registration code', () => {
      expect(getInviteCodeByRegistrationCode('LOCK1')).toBe('invite1');
      expect(getInviteCodeByRegistrationCode('LOCK2')).toBe('invite2');
      expect(getInviteCodeByRegistrationCode('LOCK3')).toBe('invite3');
    });

    it('should return null for invalid registration code', () => {
      const result = getInviteCodeByRegistrationCode('INVALID_CODE');
      expect(result).toBeNull();
    });
  });

  describe('hasAdmin', () => {
    it('should return true when lock has admin', () => {
      assignAdminToLock('LOCK1', 'admin@test.com', 'Lock 1');
      const result = hasAdmin('invite1');
      expect(result).toBe(true);
    });

    it('should return false when lock has no admin', () => {
      const result = hasAdmin('invite5');
      expect(result).toBe(false);
    });

    it('should return false for invalid invite code', () => {
      const result = hasAdmin('invalid_invite');
      expect(result).toBe(false);
    });
  });

  describe('updateEmail', () => {
    beforeEach(() => {
      assignAdminToLock('LOCK1', 'oldemail@test.com', 'Lock 1');
      assignAdminToLock('LOCK2', 'other@test.com', 'Lock 2');
      addNonAdminUser('invite2', 'oldemail@test.com');
    });

    it('should update admin email in all locks', () => {
      updateEmail('oldemail@test.com', 'newemail@test.com');
      
      const locks = findLocksByEmail('newemail@test.com');
      expect(locks.length).toBeGreaterThan(0);
      
      const oldLocks = findLocksByEmail('oldemail@test.com');
      expect(oldLocks.length).toBe(0);
    });

    it('should update guest email in all locks', () => {
      updateEmail('oldemail@test.com', 'newemail@test.com');
      
      const lock = findLockByRegistrationCode('LOCK2');
      const hasNewEmail = lock.nonAdminUsers.some(user => user.email === 'newemail@test.com');
      expect(hasNewEmail).toBe(true);
      
      const hasOldEmail = lock.nonAdminUsers.some(user => user.email === 'oldemail@test.com');
      expect(hasOldEmail).toBe(false);
    });

    it('should not affect other emails', () => {
      updateEmail('oldemail@test.com', 'newemail@test.com');
      
      const otherLocks = findLocksByEmail('other@test.com');
      expect(otherLocks.length).toBeGreaterThan(0);
    });
  });

  describe('removeUserAccess', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = {
        body: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      axios.post.mockResolvedValue({ status: 200 });
    });

    it('should return 400 when email or code is missing', async () => {
      mockReq.body = { email: 'test@test.com' };
      
      await removeUserAccess(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email e código são obrigatórios.' });
    });

    it('should return 404 when lock is not found', async () => {
      mockReq.body = { email: 'test@test.com', code: 'INVALID_CODE' };
      
      await removeUserAccess(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Fechadura não encontrada.' });
    });

    it('should remove admin and all users when admin removes access', async () => {
      // Setup
      assignAdminToLock('LOCK1', 'admin@test.com', 'Lock 1');
      addNonAdminUser('invite1', 'guest@test.com');
      
      mockReq.body = { email: 'admin@test.com', code: 'LOCK1' };
      
      await removeUserAccess(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Admin e todos os usuários foram desconectados.' });
      expect(axios.post).toHaveBeenCalled();
      
      const lock = findLockByRegistrationCode('LOCK1');
      expect(lock.adminEmail).toBe('');
      expect(lock.nonAdminUsers.length).toBe(0);
    });

    it('should remove only guest user when non-admin removes access', async () => {
      // Setup
      assignAdminToLock('LOCK2', 'admin@test.com', 'Lock 2');
      addNonAdminUser('invite2', 'guest@test.com');
      
      mockReq.body = { email: 'guest@test.com', code: 'LOCK2' };
      
      await removeUserAccess(mockReq, mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Acesso de usuário removido.' });
      
      const lock = findLockByRegistrationCode('LOCK2');
      expect(lock.adminEmail).toBe('admin@test.com'); // Admin still there
      expect(isEmailRegistered('invite2', 'guest@test.com')).toBe(false);
    });

    it('should return 403 when guest user not found', async () => {
      assignAdminToLock('LOCK3', 'admin@test.com', 'Lock 3');
      
      mockReq.body = { email: 'nonexistent@test.com', code: 'LOCK3' };
      
      await removeUserAccess(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado nesta fechadura.' });
    });
  });

  describe('removeInvitedUser', () => {
    beforeEach(() => {
      assignAdminToLock('LOCK1', 'admin@test.com', 'Lock 1');
      addNonAdminUser('invite1', 'guest1@test.com');
      addNonAdminUser('invite1', 'guest2@test.com');
      axios.post.mockResolvedValue({ status: 200 });
    });

    it('should remove invited user successfully', () => {
      const result = removeInvitedUser('LOCK1', 'guest1@test.com');
      
      expect(result).toBe(true);
      expect(isEmailRegistered('invite1', 'guest1@test.com')).toBe(false);
      expect(isEmailRegistered('invite1', 'guest2@test.com')).toBe(true);
    });

    it('should return false when user not found', () => {
      const result = removeInvitedUser('LOCK1', 'notexist@test.com');
      expect(result).toBe(false);
    });

    it('should return false when lock not found', () => {
      const result = removeInvitedUser('INVALID_CODE', 'guest1@test.com');
      expect(result).toBe(false);
    });

    it('should call user service to remove code', () => {
      removeInvitedUser('LOCK1', 'guest1@test.com');
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('removeOwnAccess', () => {
    beforeEach(() => {
      assignAdminToLock('LOCK2', 'admin@test.com', 'Lock 2');
      addNonAdminUser('invite2', 'guest@test.com');
      axios.post.mockResolvedValue({ status: 200 });
    });

    it('should remove own access successfully', () => {
      const result = removeOwnAccess('LOCK2', 'guest@test.com');
      
      expect(result).toBe(true);
      expect(isEmailRegistered('invite2', 'guest@test.com')).toBe(false);
    });

    it('should return false when user not in lock', () => {
      const result = removeOwnAccess('LOCK2', 'notinlock@test.com');
      expect(result).toBe(false);
    });

    it('should return false when lock not found', () => {
      const result = removeOwnAccess('INVALID_CODE', 'guest@test.com');
      expect(result).toBe(false);
    });

    it('should call user service to remove code', () => {
      removeOwnAccess('LOCK2', 'guest@test.com');
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('findLockByRegistrationCode', () => {
    it('should return lock object for valid code', () => {
      const lock = findLockByRegistrationCode('LOCK1');
      
      expect(lock).toBeDefined();
      expect(lock.registrationCode).toBe('LOCK1');
      expect(lock.inviteCode).toBe('invite1');
      expect(lock).toHaveProperty('status');
      expect(lock).toHaveProperty('adminEmail');
      expect(lock).toHaveProperty('nonAdminUsers');
    });

    it('should return undefined for invalid code', () => {
      const lock = findLockByRegistrationCode('INVALID_CODE');
      expect(lock).toBeUndefined();
    });

    it('should return lock with current state', () => {
      assignAdminToLock('LOCK3', 'admin@test.com', 'Lock 3');
      setStatus('LOCK3', 'Open');
      
      const lock = findLockByRegistrationCode('LOCK3');
      
      expect(lock.adminEmail).toBe('admin@test.com');
      expect(lock.lockName).toBe('Lock 3');
      expect(lock.status).toBe('Open');
    });
  });
});

