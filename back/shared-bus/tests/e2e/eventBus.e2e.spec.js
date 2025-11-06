const request = require('supertest');
const app = require('../../eventBus');
const axios = require('axios');

// Mock dos serviços externos
jest.mock('axios');
const mockedAxios = axios;

describe('Event Bus - E2E Tests', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ status: 200, data: { message: 'OK' } });
  });

  describe('GET /api/events/health - Health Check', () => {
    it('Deve retornar status OK', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('event-bus');
    });

    it('Deve retornar resposta em JSON', async () => {
      const response = await request(app)
        .get('/api/events/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('Deve estar sempre disponível', async () => {
      // Múltiplas requisições consecutivas
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/api/events/health');
        expect(response.status).toBe(200);
      }
    });
  });

  describe('POST /api/events/join - Publicar Evento', () => {
    it('Deve publicar evento e propagar para user-service e log-service', async () => {
      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'test@example.com',
          action: 'opened lock',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('ok');

      // Verificar se os serviços foram chamados
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      // Verificar chamada para user-service
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://user-service.electronic-lock-app.svc.cluster.local:3001/api/users/join',
        event
      );

      // Verificar chamada para log-service
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://log-service.electronic-lock-app.svc.cluster.local:3002/api/logs/join',
        event
      );
    });

    it('Deve propagar evento ADMIN_REMOVED', async () => {
      const event = {
        type: 'ADMIN_REMOVED',
        data: {
          lockCode: 'LOCK1'
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      
      // Verificar que o evento foi passado corretamente
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('user-service'),
        event
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('log-service'),
        event
      );
    });

    it('Deve propagar evento USER_REMOVED', async () => {
      const event = {
        type: 'USER_REMOVED',
        data: {
          email: 'user@example.com',
          code: 'LOCK1'
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve propagar evento LOCK_ACTION com ação de abrir', async () => {
      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'test@example.com',
          action: 'opened',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve propagar evento LOCK_ACTION com ação de fechar', async () => {
      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'test@example.com',
          action: 'closed',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve propagar evento USER_JOINED', async () => {
      const event = {
        type: 'USER_JOINED',
        data: {
          email: 'newuser@example.com',
          code: 'LOCK2',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve propagar evento EMAIL_UPDATED', async () => {
      const event = {
        type: 'EMAIL_UPDATED',
        data: {
          oldEmail: 'old@example.com',
          newEmail: 'new@example.com'
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve lidar com falhas de comunicação graciosamente', async () => {
      // Simular falha em um dos serviços
      mockedAxios.post
        .mockResolvedValueOnce({ status: 200 })
        .mockRejectedValueOnce(new Error('Service unavailable'));

      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'test@example.com',
          action: 'opened lock',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      // O event bus ainda deve retornar 200 mesmo se um serviço falhar
      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve aceitar eventos com diferentes estruturas', async () => {
      const eventTypes = [
        {
          type: 'LOCK_ACTION',
          data: { user: 'user1@test.com', action: 'opened', code: 'LOCK1', timestamp: new Date().toISOString() }
        },
        {
          type: 'ADMIN_REMOVED',
          data: { lockCode: 'LOCK2' }
        },
        {
          type: 'USER_JOINED',
          data: { email: 'user2@test.com', code: 'LOCK3', timestamp: new Date().toISOString() }
        },
        {
          type: 'EMAIL_UPDATED',
          data: { oldEmail: 'old@test.com', newEmail: 'new@test.com' }
        }
      ];

      for (const event of eventTypes) {
        const response = await request(app)
          .post('/api/events/join')
          .send(event);

        expect(response.status).toBe(200);
      }

      // Cada evento deve ser propagado 2 vezes (user-service e log-service)
      expect(mockedAxios.post).toHaveBeenCalledTimes(eventTypes.length * 2);
    });

    it('Deve propagar eventos com dados complexos', async () => {
      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'admin@example.com',
          action: 'opened',
          code: 'LOCK1',
          timestamp: new Date().toISOString(),
          metadata: {
            device: 'mobile-app',
            location: 'remote',
            ipAddress: '192.168.1.1'
          }
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          type: 'LOCK_ACTION',
          data: expect.objectContaining({
            user: 'admin@example.com',
            metadata: expect.any(Object)
          })
        })
      );
    });
  });

  describe('Integração entre Serviços', () => {
    it('Deve garantir que eventos sejam propagados de forma assíncrona', async () => {
      const events = [
        {
          type: 'LOCK_ACTION',
          data: { user: 'user1@test.com', action: 'opened', code: 'LOCK1', timestamp: new Date().toISOString() }
        },
        {
          type: 'LOCK_ACTION',
          data: { user: 'user2@test.com', action: 'closed', code: 'LOCK1', timestamp: new Date().toISOString() }
        },
        {
          type: 'LOCK_ACTION',
          data: { user: 'user1@test.com', action: 'opened', code: 'LOCK1', timestamp: new Date().toISOString() }
        }
      ];

      // Enviar múltiplos eventos em sequência
      for (const event of events) {
        await request(app)
          .post('/api/events/join')
          .send(event);
      }

      // Verificar que todos os eventos foram propagados
      expect(mockedAxios.post).toHaveBeenCalledTimes(events.length * 2);
    });

    it('Deve propagar eventos na ordem correta', async () => {
      const events = [
        { type: 'EVENT_1', data: { order: 1 } },
        { type: 'EVENT_2', data: { order: 2 } },
        { type: 'EVENT_3', data: { order: 3 } }
      ];

      for (const event of events) {
        await request(app)
          .post('/api/events/join')
          .send(event);
      }

      // Verificar a ordem das chamadas
      const calls = mockedAxios.post.mock.calls;
      expect(calls[0][1]).toEqual(events[0]);
      expect(calls[2][1]).toEqual(events[1]);
      expect(calls[4][1]).toEqual(events[2]);
    });

    it('Deve lidar com carga alta de eventos', async () => {
      const eventCount = 50;
      const events = Array.from({ length: eventCount }, (_, i) => ({
        type: 'LOCK_ACTION',
        data: { user: `user${i}@test.com`, action: 'opened', code: `LOCK${i % 5}` }
      }));

      // Enviar todos os eventos
      const promises = events.map(event =>
        request(app)
          .post('/api/events/join')
          .send(event)
      );

      const responses = await Promise.all(promises);

      // Todos devem ter sucesso
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Todos devem ter sido propagados
      expect(mockedAxios.post).toHaveBeenCalledTimes(eventCount * 2);
    });
  });

  describe('Cenários de Erro', () => {
    it('Deve retornar 200 mesmo quando ambos os serviços falham', async () => {
      mockedAxios.post.mockRejectedValue(new Error('All services unavailable'));

      const event = {
        type: 'LOCK_ACTION',
        data: {
          user: 'test@example.com',
          action: 'opened lock',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      // O event bus não deve lançar erro mesmo se os serviços falharem
      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('Deve continuar propagando após falha parcial', async () => {
      // Primeiro evento falha no user-service
      mockedAxios.post
        .mockRejectedValueOnce(new Error('User service down'))
        .mockResolvedValueOnce({ status: 200 });

      const event1 = testUtils.generateTestEvent();
      const response1 = await request(app)
        .post('/api/events/join')
        .send(event1);

      expect(response1.status).toBe(200);

      // Segundo evento deve funcionar normalmente
      mockedAxios.post.mockResolvedValue({ status: 200 });
      
      const event2 = testUtils.generateTestEvent();
      const response2 = await request(app)
        .post('/api/events/join')
        .send(event2);

      expect(response2.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(4); // 2 + 2
    });

    it('Deve lidar com timeout de serviços', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Timeout'));

      const event = testUtils.generateTestEvent();
      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
    });

    it('Deve lidar com respostas 500 dos serviços', async () => {
      mockedAxios.post.mockResolvedValue({ status: 500, data: { error: 'Internal error' } });

      const event = testUtils.generateTestEvent();
      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Validação de Payload', () => {
    it('Deve aceitar evento com campos mínimos', async () => {
      const event = {
        type: 'SIMPLE_EVENT',
        data: {}
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
    });

    it('Deve aceitar evento sem campo type', async () => {
      const event = {
        data: { some: 'data' }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
    });

    it('Deve aceitar evento sem campo data', async () => {
      const event = {
        type: 'NO_DATA_EVENT'
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
    });

    it('Deve aceitar evento vazio', async () => {
      const response = await request(app)
        .post('/api/events/join')
        .send({});

      expect(response.status).toBe(200);
    });

    it('Deve aceitar arrays no payload', async () => {
      const event = {
        type: 'BATCH_EVENT',
        data: {
          items: [1, 2, 3, 4, 5]
        }
      };

      const response = await request(app)
        .post('/api/events/join')
        .send(event);

      expect(response.status).toBe(200);
    });
  });

  describe('Performance', () => {
    it('Deve processar eventos rapidamente', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/events/join')
        .send(testUtils.generateTestEvent());

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Deve processar em menos de 1 segundo
      expect(duration).toBeLessThan(1000);
    });

    it('Deve lidar com eventos concorrentes sem degradação', async () => {
      const concurrentRequests = 20;
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app)
          .post('/api/events/join')
          .send(testUtils.generateTestEvent())
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Processamento concorrente não deve demorar muito mais que sequencial
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Integração Completa', () => {
    it('Deve simular fluxo completo de ação em fechadura', async () => {
      // 1. Usuário abre fechadura
      const openEvent = {
        type: 'LOCK_ACTION',
        data: {
          user: 'user@example.com',
          action: 'opened',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const openResponse = await request(app)
        .post('/api/events/join')
        .send(openEvent);

      expect(openResponse.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      // 2. Usuário fecha fechadura
      const closeEvent = {
        type: 'LOCK_ACTION',
        data: {
          user: 'user@example.com',
          action: 'closed',
          code: 'LOCK1',
          timestamp: new Date().toISOString()
        }
      };

      const closeResponse = await request(app)
        .post('/api/events/join')
        .send(closeEvent);

      expect(closeResponse.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledTimes(4);
    });

    it('Deve simular fluxo de gerenciamento de usuários', async () => {
      // 1. Novo usuário entra
      await request(app)
        .post('/api/events/join')
        .send(testUtils.generateTestEvent('USER_JOINED'));

      // 2. Admin remove usuário
      await request(app)
        .post('/api/events/join')
        .send(testUtils.generateUserRemovedEvent());

      // 3. Admin é removido
      await request(app)
        .post('/api/events/join')
        .send(testUtils.generateAdminRemovedEvent());

      expect(mockedAxios.post).toHaveBeenCalledTimes(6); // 3 events × 2 services
    });
  });
});

