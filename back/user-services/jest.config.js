module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.spec.js',
    '**/tests/unit/**/*.spec.js',
    '**/tests/e2e/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!jest.config.js',
    '!server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Force exit after tests complete to prevent hanging on open handles
  // This is necessary for E2E tests where database connections might not close properly
  forceExit: true
};

