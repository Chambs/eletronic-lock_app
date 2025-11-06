import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage with actual storage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn();

