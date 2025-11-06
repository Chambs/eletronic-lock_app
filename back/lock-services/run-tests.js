#!/usr/bin/env node

/**
 * Simple test runner script for lock-services
 * Usage: node run-tests.js [options]
 * 
 * Options:
 *   --unit       Run only unit tests
 *   --e2e        Run only e2e tests
 *   --coverage   Run with coverage
 *   --watch      Run in watch mode
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const jestBin = path.join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');
const jestConfig = path.join(__dirname, 'jest.config.js');

let jestArgs = ['--config', jestConfig];

// Parse custom arguments
if (args.includes('--unit')) {
  jestArgs.push('tests/unit');
} else if (args.includes('--e2e')) {
  jestArgs.push('tests/e2e');
}

if (args.includes('--coverage')) {
  jestArgs.push('--coverage');
}

if (args.includes('--watch')) {
  jestArgs.push('--watch');
}

if (args.includes('--verbose')) {
  jestArgs.push('--verbose');
}

console.log('🧪 Running Lock Services Tests...\n');
console.log(`Command: node ${jestBin} ${jestArgs.join(' ')}\n`);

const jest = spawn('node', [jestBin, ...jestArgs], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

jest.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed.');
  }
  process.exit(code);
});

jest.on('error', (err) => {
  console.error('❌ Failed to run tests:', err);
  process.exit(1);
});

