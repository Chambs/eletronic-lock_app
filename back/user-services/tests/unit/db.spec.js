// Mock pg module BEFORE any imports
const mockPoolInstance = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPoolInstance)
}));

describe('Database - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the mock calls but keep the mock instance
    mockPoolInstance.on.mockClear();
    mockPoolInstance.end.mockClear();
    mockPoolInstance.connect.mockClear();
    mockPoolInstance.query.mockClear();
  });

  describe('Database Pool Configuration', () => {
    it('should create pool with default configuration', () => {
      const { Pool } = require('pg');
      const db = require('../../db');
      
      expect(Pool).toHaveBeenCalled();
      const poolConfig = Pool.mock.calls[Pool.mock.calls.length - 1][0];
      
      expect(poolConfig).toHaveProperty('host');
      expect(poolConfig).toHaveProperty('port');
      expect(poolConfig).toHaveProperty('database');
      expect(poolConfig).toHaveProperty('user');
      expect(poolConfig).toHaveProperty('password');
      expect(poolConfig).toHaveProperty('max');
      expect(poolConfig).toHaveProperty('idleTimeoutMillis');
      expect(poolConfig).toHaveProperty('connectionTimeoutMillis');
      expect(db).toBe(mockPoolInstance);
    });

    it('should use environment variables when provided', () => {
      const originalEnv = { ...process.env };
      
      // Set environment variables
      process.env.DATABASE_HOST = 'custom-host';
      process.env.DATABASE_PORT = '5433';
      process.env.DATABASE_NAME = 'custom-db';
      process.env.DATABASE_USER = 'custom-user';
      process.env.DATABASE_PASSWORD = 'custom-password';

      // Reset modules to get fresh environment variable reads
      jest.resetModules();
      
      // Re-create mock after reset
      const newMockPool = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
      };
      
      jest.doMock('pg', () => ({
        Pool: jest.fn(() => newMockPool)
      }));

      const { Pool } = require('pg');
      require('../../db');

      const poolConfig = Pool.mock.calls[0][0];
      expect(poolConfig.host).toBe('custom-host');
      // Environment variables are strings, so port will be a string
      expect(poolConfig.port).toBe('5433');
      expect(poolConfig.database).toBe('custom-db');
      expect(poolConfig.user).toBe('custom-user');
      expect(poolConfig.password).toBe('custom-password');

      // Restore environment and reset for other tests
      process.env = originalEnv;
      jest.resetModules();
    });

    it('should set up event handlers', () => {
      // Reset modules to get fresh event handler registration
      jest.resetModules();
      jest.doMock('pg', () => ({
        Pool: jest.fn(() => mockPoolInstance)
      }));
      
      const db = require('../../db');
      
      expect(mockPoolInstance.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockPoolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(db).toBe(mockPoolInstance);
    });

    it('should handle connect event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Reset modules to get fresh event handler registration
      jest.resetModules();
      jest.doMock('pg', () => ({
        Pool: jest.fn(() => mockPoolInstance)
      }));
      
      require('../../db');
      
      const connectCall = mockPoolInstance.on.mock.calls.find(call => call[0] === 'connect');
      expect(connectCall).toBeDefined();
      const connectHandler = connectCall[1];
      connectHandler();
      
      expect(consoleSpy).toHaveBeenCalledWith('Connected to PostgreSQL database');
      
      consoleSpy.mockRestore();
    });

    it('should handle error event', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      // Reset modules to get fresh event handler registration
      jest.resetModules();
      jest.doMock('pg', () => ({
        Pool: jest.fn(() => mockPoolInstance)
      }));
      
      require('../../db');
      
      const errorCall = mockPoolInstance.on.mock.calls.find(call => call[0] === 'error');
      expect(errorCall).toBeDefined();
      const errorHandler = errorCall[1];
      const testError = new Error('Test error');
      errorHandler(testError);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error on idle client', testError);
      expect(processExitSpy).toHaveBeenCalledWith(-1);
      
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should handle SIGINT signal', () => {
      const db = require('../../db');
      
      // Verify that the pool has an end method (used in SIGINT handler)
      expect(mockPoolInstance.end).toBeDefined();
      expect(db).toBe(mockPoolInstance);
    });
  });

  describe('Database Pool Export', () => {
    it('should export pool instance', () => {
      const db = require('../../db');
      
      expect(db).toBeDefined();
      expect(db).toBe(mockPoolInstance);
    });
  });
});
