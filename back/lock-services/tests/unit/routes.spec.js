const request = require('supertest');
const express = require('express');
const router = require('../../routes');
const controller = require('../../controllers');

// Mock the controller module
jest.mock('../../controllers');

describe('Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/locks', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/locks/status', () => {
    it('should return status from query parameter', async () => {
      controller.getStatus.mockReturnValue('Closed');

      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: 'LOCK1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'Closed' });
      expect(controller.getStatus).toHaveBeenCalledWith('LOCK1');
    });

    it('should call getStatus with undefined when no code provided', async () => {
      controller.getStatus.mockReturnValue('Fechadura não encontrada');

      const response = await request(app)
        .get('/api/locks/status');

      expect(response.status).toBe(200);
      expect(controller.getStatus).toHaveBeenCalled();
    });
  });

  describe('POST /api/locks/status', () => {
    it('should update status to Open successfully', async () => {
      controller.setStatus.mockReturnValue('Status atualizado');
      controller.getStatus.mockReturnValue('Open');

      const response = await request(app)
        .post('/api/locks/status')
        .send({ code: 'LOCK1', status: 'Open' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'Open' });
      expect(controller.setStatus).toHaveBeenCalledWith('LOCK1', 'Open');
    });

    it('should update status to Closed successfully', async () => {
      controller.setStatus.mockReturnValue('Status atualizado');
      controller.getStatus.mockReturnValue('Closed');

      const response = await request(app)
        .post('/api/locks/status')
        .send({ code: 'LOCK1', status: 'Closed' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'Closed' });
      expect(controller.setStatus).toHaveBeenCalledWith('LOCK1', 'Closed');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({ code: 'LOCK1', status: 'InvalidStatus' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Status inválido.' });
      expect(controller.setStatus).not.toHaveBeenCalled();
    });

    it('should reject status "open" (lowercase)', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({ code: 'LOCK1', status: 'open' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Status inválido.' });
    });
  });

  describe('POST /api/locks/locks', () => {
    it('should return list of locks for user', async () => {
      const mockLocks = [
        { registrationCode: 'LOCK1', lockName: 'Lock 1', isAdmin: true },
        { registrationCode: 'LOCK2', lockName: 'Lock 2', isAdmin: false }
      ];
      controller.findLocksByEmail.mockReturnValue(mockLocks);

      const response = await request(app)
        .post('/api/locks/locks')
        .send({ email: 'user@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ list: mockLocks });
      expect(controller.findLocksByEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('should return empty list when user has no locks', async () => {
      controller.findLocksByEmail.mockReturnValue([]);

      const response = await request(app)
        .post('/api/locks/locks')
        .send({ email: 'newuser@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ list: [] });
    });
  });

  describe('POST /api/locks/remove-user-access', () => {
    it('should call removeUserAccess controller', async () => {
      controller.removeUserAccess.mockImplementation((req, res) => {
        res.json({ message: 'Access removed' });
      });

      const response = await request(app)
        .post('/api/locks/remove-user-access')
        .send({ email: 'user@test.com', code: 'LOCK1' });

      expect(controller.removeUserAccess).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/locks/locks/:registrationCode/invitee/:email', () => {
    it('should remove invited user when requester is admin', async () => {
      const mockLock = { adminEmail: 'admin@test.com', registrationCode: 'LOCK1' };
      controller.findLockByRegistrationCode.mockReturnValue(mockLock);
      controller.removeInvitedUser.mockReturnValue(true);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/invitee/guest@test.com')
        .send({ requester: 'admin@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Usuário removido com sucesso.' });
      expect(controller.removeInvitedUser).toHaveBeenCalledWith('LOCK1', 'guest@test.com');
    });

    it('should return 403 when requester is not admin', async () => {
      const mockLock = { adminEmail: 'admin@test.com', registrationCode: 'LOCK1' };
      controller.findLockByRegistrationCode.mockReturnValue(mockLock);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/invitee/guest@test.com')
        .send({ requester: 'notadmin@test.com' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Apenas admin pode remover convidados.' });
      expect(controller.removeInvitedUser).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      const mockLock = { adminEmail: 'admin@test.com', registrationCode: 'LOCK1' };
      controller.findLockByRegistrationCode.mockReturnValue(mockLock);
      controller.removeInvitedUser.mockReturnValue(false);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/invitee/nonexistent@test.com')
        .send({ requester: 'admin@test.com' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado para remover.' });
    });

    it('should accept requester from query parameter', async () => {
      const mockLock = { adminEmail: 'admin@test.com', registrationCode: 'LOCK1' };
      controller.findLockByRegistrationCode.mockReturnValue(mockLock);
      controller.removeInvitedUser.mockReturnValue(true);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/invitee/guest@test.com?requester=admin@test.com');

      expect(response.status).toBe(200);
    });

    it('should return 403 when lock not found', async () => {
      controller.findLockByRegistrationCode.mockReturnValue(null);

      const response = await request(app)
        .delete('/api/locks/locks/INVALID/invitee/guest@test.com')
        .send({ requester: 'admin@test.com' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/locks/locks/:registrationCode/self-access', () => {
    it('should remove own access successfully', async () => {
      controller.removeOwnAccess.mockReturnValue(true);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/self-access')
        .send({ userEmail: 'user@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Acesso removido com sucesso.' });
      expect(controller.removeOwnAccess).toHaveBeenCalledWith('LOCK1', 'user@test.com');
    });

    it('should return 404 when access not found', async () => {
      controller.removeOwnAccess.mockReturnValue(false);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/self-access')
        .send({ userEmail: 'user@test.com' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Acesso não encontrado.' });
    });

    it('should accept userEmail from query parameter', async () => {
      controller.removeOwnAccess.mockReturnValue(true);

      const response = await request(app)
        .delete('/api/locks/locks/LOCK1/self-access?userEmail=user@test.com');

      expect(response.status).toBe(200);
      expect(controller.removeOwnAccess).toHaveBeenCalledWith('LOCK1', 'user@test.com');
    });
  });

  describe('POST /api/locks/register', () => {
    it('should register lock with admin successfully', async () => {
      controller.isLockCodeExists.mockReturnValue(true);
      controller.hasNoAdminForLock.mockReturnValue(true);
      controller.assignAdminToLock.mockReturnValue(true);

      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: 'LOCK1',
          nickname: 'My Lock',
          admin: 'admin@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Fechadura registrada com sucesso.' });
      expect(controller.assignAdminToLock).toHaveBeenCalledWith('LOCK1', 'admin@test.com', 'My Lock');
    });

    it('should return 404 when lock code does not exist', async () => {
      controller.isLockCodeExists.mockReturnValue(false);

      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: 'INVALID',
          nickname: 'My Lock',
          admin: 'admin@test.com'
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Código de registro inválido.' });
      expect(controller.assignAdminToLock).not.toHaveBeenCalled();
    });

    it('should return 409 when lock already has admin', async () => {
      controller.isLockCodeExists.mockReturnValue(true);
      controller.hasNoAdminForLock.mockReturnValue(false);

      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: 'LOCK1',
          nickname: 'My Lock',
          admin: 'admin@test.com'
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Fechadura já registrada em um email.' });
      expect(controller.assignAdminToLock).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/locks/join', () => {
    it('should join lock as guest successfully', async () => {
      controller.isInviteCodeExists.mockReturnValue(true);
      controller.isEmailRegistered.mockReturnValue(false);
      controller.hasAdmin.mockReturnValue(true);
      controller.addNonAdminUser.mockReturnValue(true);
      controller.getRegistrationCodeByInviteCode.mockReturnValue('LOCK1');

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: 'guest@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Agora você é um usuário dessa fechadura.');
      expect(response.body.registrationCode).toBe('LOCK1');
      expect(controller.addNonAdminUser).toHaveBeenCalledWith('invite1', 'guest@test.com');
    });

    it('should return 404 for invalid invitation code', async () => {
      controller.isInviteCodeExists.mockReturnValue(false);

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invalid',
          email: 'guest@test.com'
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Código de convite inválido.' });
    });

    it('should return 409 when email already registered', async () => {
      controller.isInviteCodeExists.mockReturnValue(true);
      controller.isEmailRegistered.mockReturnValue(true);

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: 'existing@test.com'
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Você já está registrado nessa fechadura.' });
    });

    it('should return 423 when lock has no admin', async () => {
      controller.isInviteCodeExists.mockReturnValue(true);
      controller.isEmailRegistered.mockReturnValue(false);
      controller.hasAdmin.mockReturnValue(false);

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: 'guest@test.com'
        });

      expect(response.status).toBe(423);
      expect(response.body).toEqual({ error: 'Esta fechadura ainda não está disponível.' });
    });

    it('should handle ADMIN_REMOVED event', async () => {
      const mockLock = {
        registrationCode: 'LOCK1',
        adminEmail: 'admin@test.com',
        nonAdminUsers: [{ email: 'guest@test.com' }]
      };
      controller.findLockByRegistrationCode.mockReturnValue(mockLock);

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'ADMIN_REMOVED',
          data: { lockCode: 'LOCK1' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Fechadura resetada.' });
      expect(mockLock.adminEmail).toBe('');
      expect(mockLock.nonAdminUsers).toEqual([]);
    });

    it('should return 404 for ADMIN_REMOVED when lock not found', async () => {
      controller.findLockByRegistrationCode.mockReturnValue(null);

      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'ADMIN_REMOVED',
          data: { lockCode: 'INVALID' }
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Fechadura não encontrada.' });
    });
  });

  describe('GET /api/locks/invite-code', () => {
    it('should return invite code for registration code', async () => {
      controller.getInviteCodeByRegistrationCode.mockReturnValue('invite1');

      const response = await request(app)
        .get('/api/locks/invite-code')
        .query({ code: 'LOCK1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ inviteCode: 'invite1' });
      expect(controller.getInviteCodeByRegistrationCode).toHaveBeenCalledWith('LOCK1');
    });

    it('should return null when code not found', async () => {
      controller.getInviteCodeByRegistrationCode.mockReturnValue(null);

      const response = await request(app)
        .get('/api/locks/invite-code')
        .query({ code: 'INVALID' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ inviteCode: null });
    });
  });

  describe('POST /api/locks/update-email', () => {
    it('should update email successfully', async () => {
      controller.updateEmail.mockReturnValue();

      const response = await request(app)
        .post('/api/locks/update-email')
        .send({
          email: 'old@test.com',
          newEmail: 'new@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Email atualizado.' });
      expect(controller.updateEmail).toHaveBeenCalledWith('old@test.com', 'new@test.com');
    });

    it('should call updateEmail even with empty emails', async () => {
      controller.updateEmail.mockReturnValue();

      const response = await request(app)
        .post('/api/locks/update-email')
        .send({
          email: '',
          newEmail: ''
        });

      expect(response.status).toBe(200);
      expect(controller.updateEmail).toHaveBeenCalledWith('', '');
    });
  });
});

