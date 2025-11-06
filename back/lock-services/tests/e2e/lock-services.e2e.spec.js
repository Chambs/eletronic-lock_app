const request = require('supertest');
const app = require('../../server');
const axios = require('axios');
const { resetLocks } = require('../../controllers');

// Mock dos serviços externos
jest.mock('axios');
const mockedAxios = axios;

describe('Lock Services - E2E Tests', () => {
  const testEmail = `test_${Date.now()}@test.com`;
  const testLockCode = 'LOCK1';
  const testInviteCode = 'invite1';

  beforeAll(() => {
    // Mock dos serviços externos
    mockedAxios.post.mockResolvedValue({ status: 200, data: { message: 'OK' } });
  });

  afterAll(() => {
    // Reset locks after all E2E tests complete
    resetLocks();
  });

  describe('GET /api/locks/status - Obter Status da Fechadura', () => {
    it('Deve retornar status da fechadura', async () => {
      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: testLockCode });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(['Closed', 'Open', 'Fechadura não encontrada']).toContain(response.body.status);
    });

    it('Deve retornar "Fechadura não encontrada" para código inválido', async () => {
      const response = await request(app)
        .get('/api/locks/status')
        .query({ code: 'INVALID_CODE' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Fechadura não encontrada');
    });
  });

  describe('POST /api/locks/status - Atualizar Status da Fechadura', () => {
    it('Deve abrir a fechadura com sucesso', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({
          code: testLockCode,
          status: 'Open'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');

      // Verificar se o status foi atualizado
      const statusResponse = await request(app)
        .get('/api/locks/status')
        .query({ code: testLockCode });

      expect(statusResponse.body.status).toBe('Open');
    });

    it('Deve fechar a fechadura com sucesso', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({
          code: testLockCode,
          status: 'Closed'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');

      // Verificar se o status foi atualizado
      const statusResponse = await request(app)
        .get('/api/locks/status')
        .query({ code: testLockCode });

      expect(statusResponse.body.status).toBe('Closed');
    });

    it('Deve retornar erro 400 para status inválido', async () => {
      const response = await request(app)
        .post('/api/locks/status')
        .send({
          code: testLockCode,
          status: 'InvalidStatus'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Status inválido.');
    });
  });

  describe('POST /api/locks/locks - Listar Fechaduras do Usuário', () => {
    it('Deve retornar lista vazia para usuário sem fechaduras', async () => {
      const response = await request(app)
        .post('/api/locks/locks')
        .send({
          email: testEmail
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('Deve retornar fechaduras do usuário após registro', async () => {
      // Registrar usuário como admin de uma fechadura
      mockedAxios.post.mockResolvedValueOnce({ status: 200 });
      await request(app)
        .post('/api/locks/register')
        .send({
          code: testLockCode,
          nickname: 'Test Lock',
          admin: testEmail
        });

      const response = await request(app)
        .post('/api/locks/locks')
        .send({
          email: testEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.list).toBeInstanceOf(Array);
      expect(response.body.list.length).toBeGreaterThan(0);
      expect(response.body.list[0]).toHaveProperty('registrationCode');
      expect(response.body.list[0]).toHaveProperty('isAdmin');
    });
  });

  describe('POST /api/locks/register - Registrar Fechadura como Admin', () => {
    it('Deve registrar fechadura como admin com sucesso', async () => {
      const lockCode = 'LOCK2';
      const email = `admin_${Date.now()}@test.com`;
      const nickname = 'Test Lock 2';

      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: lockCode,
          nickname: nickname,
          admin: email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Fechadura registrada com sucesso.');

      // Verificar se foi registrado
      const locksResponse = await request(app)
        .post('/api/locks/locks')
        .send({
          email: email
        });

      expect(locksResponse.body.list.length).toBeGreaterThan(0);
    });

    it('Deve retornar erro 404 para código de registro inválido', async () => {
      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: 'INVALID_CODE',
          nickname: 'Test Lock',
          admin: testEmail
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Código de registro inválido.');
    });

    it('Deve retornar erro 409 quando fechadura já tem admin', async () => {
      // Registrar primeira vez
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/register')
        .send({
          code: 'LOCK3',
          nickname: 'Test Lock 3',
          admin: testEmail
        });

      // Tentar registrar novamente
      const anotherEmail = `another_${Date.now()}@test.com`;
      const response = await request(app)
        .post('/api/locks/register')
        .send({
          code: 'LOCK3',
          nickname: 'Test Lock 3',
          admin: anotherEmail
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Fechadura já registrada em um email.');
    });
  });

  describe('POST /api/locks/join - Participar de Fechadura como Convidado', () => {
    let adminEmail;
    let guestEmail;
    let testLockCode;

    beforeAll(async () => {
      testLockCode = 'LOCK4';
      adminEmail = `admin_${Date.now()}@test.com`;
      guestEmail = `guest_${Date.now()}@test.com`;

      // Registrar fechadura como admin primeiro
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/register')
        .send({
          code: testLockCode,
          nickname: 'Test Lock 4',
          admin: adminEmail
        });
    });

    it('Deve permitir que usuário participe como convidado', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite4',
          email: guestEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Agora você é um usuário dessa fechadura.');
      expect(response.body.registrationCode).toBe(testLockCode);
    });

    it('Deve retornar erro 404 para código de convite inválido', async () => {
      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'INVALID_INVITE',
          email: guestEmail
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Código de convite inválido.');
    });

    it('Deve retornar erro 409 quando usuário já está registrado na fechadura', async () => {
      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite4',
          email: guestEmail
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Você já está registrado nessa fechadura.');
    });

    it('Deve retornar erro 423 quando fechadura não tem admin', async () => {
      // Criar fechadura sem admin
      const lockWithoutAdmin = 'LOCK5';
      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite5',
          email: `newguest_${Date.now()}@test.com`
        });

      expect(response.status).toBe(423);
      expect(response.body.error).toBe('Esta fechadura ainda não está disponível.');
    });
  });

  describe('GET /api/locks/invite-code - Obter Código de Convite', () => {
    it('Deve retornar código de convite para código de registro válido', async () => {
      const response = await request(app)
        .get('/api/locks/invite-code')
        .query({ code: testLockCode });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inviteCode');
      expect(response.body.inviteCode).toBe('invite1');
    });
  });

  describe('POST /api/locks/update-email - Atualizar Email', () => {
    it('Deve atualizar email nas fechaduras', async () => {
      const oldEmail = `old_${Date.now()}@test.com`;
      const newEmail = `new_${Date.now()}@test.com`;

      // Registrar fechadura com email antigo
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/register')
        .send({
          code: 'LOCK5',
          nickname: 'Test Lock 5',
          admin: oldEmail
        });

      // Atualizar email
      const response = await request(app)
        .post('/api/locks/update-email')
        .send({
          email: oldEmail,
          newEmail: newEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email atualizado.');

      // Verificar se foi atualizado
      const locksResponse = await request(app)
        .post('/api/locks/locks')
        .send({
          email: newEmail
        });

      expect(locksResponse.body.list.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/locks/remove-user-access - Remover Acesso do Usuário', () => {
    let testEmailForAccess;
    let testLockCodeForAccess;

    beforeAll(async () => {
      testEmailForAccess = `access_${Date.now()}@test.com`;
      testLockCodeForAccess = 'LOCK1';

      // Adicionar usuário como convidado
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: testEmailForAccess
        });
    });

    it('Deve remover acesso de usuário convidado', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .post('/api/locks/remove-user-access')
        .send({
          email: testEmailForAccess,
          code: testLockCodeForAccess
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Acesso de usuário removido.');
    });

    it('Deve retornar erro 400 quando email ou código estão faltando', async () => {
      const response = await request(app)
        .post('/api/locks/remove-user-access')
        .send({
          email: testEmailForAccess
          // code faltando
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email e código são obrigatórios.');
    });

    it('Deve retornar erro 404 quando fechadura não existe', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .post('/api/locks/remove-user-access')
        .send({
          email: testEmailForAccess,
          code: 'NONEXISTENT_CODE'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Fechadura não encontrada.');
    });
  });

  describe('DELETE /api/locks/locks/:registrationCode/self-access - Remover Próprio Acesso', () => {
    let guestEmailForSelfRemoval;

    beforeAll(async () => {
      guestEmailForSelfRemoval = `self_${Date.now()}@test.com`;
      mockedAxios.post.mockResolvedValue({ status: 200 });

      // Adicionar como convidado
      await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite2',
          email: guestEmailForSelfRemoval
        });
    });

    it('Deve permitir que usuário remova seu próprio acesso', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .delete('/api/locks/locks/LOCK2/self-access')
        .send({
          userEmail: guestEmailForSelfRemoval
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Acesso removido com sucesso.');
    });
  });

  describe('DELETE /api/locks/locks/:registrationCode/invitee/:email - Remover Convidado (Admin)', () => {
    let inviteeEmail;

    beforeAll(async () => {
      inviteeEmail = `invitee_${Date.now()}@test.com`;

      // Adicionar convidado ao LOCK1 que já tem admin (testEmail)
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: inviteeEmail
        });
    });

    it('Deve permitir que admin remova convidado', async () => {
      mockedAxios.post.mockResolvedValue({ status: 200 });
      const response = await request(app)
        .delete(`/api/locks/locks/LOCK1/invitee/${inviteeEmail}`)
        .send({
          requester: testEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuário removido com sucesso.');
    });

    it('Deve retornar erro 403 quando não é admin', async () => {
      // Adicionar convidado novamente para o segundo teste
      await request(app)
        .post('/api/locks/join')
        .send({
          type: 'JOIN',
          invitationCode: 'invite1',
          email: `another_${Date.now()}@test.com`
        });

      const response = await request(app)
        .delete(`/api/locks/locks/LOCK1/invitee/${inviteeEmail}`)
        .send({
          requester: inviteeEmail // Não é admin
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Apenas admin pode remover convidados.');
    });
  });

  describe('POST /api/locks/join - Evento ADMIN_REMOVED', () => {
    it('Deve resetar fechadura quando admin é removido', async () => {
      const adminEmail = `admin_reset_${Date.now()}@test.com`;
      const lockCode = 'LOCK1';

      // Registrar fechadura
      mockedAxios.post.mockResolvedValue({ status: 200 });
      await request(app)
        .post('/api/locks/register')
        .send({
          code: lockCode,
          nickname: 'Test Lock Reset',
          admin: adminEmail
        });

      // Enviar evento ADMIN_REMOVED
      const response = await request(app)
        .post('/api/locks/join')
        .send({
          type: 'ADMIN_REMOVED',
          data: {
            lockCode: lockCode
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Fechadura resetada.');

      // Verificar se não tem mais admin
      const locksResponse = await request(app)
        .post('/api/locks/locks')
        .send({
          email: adminEmail
        });

      expect(locksResponse.body.list.length).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('Deve retornar status OK', async () => {
      const response = await request(app)
        .get('/api/locks/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('lock-service');
    });
  });
});

