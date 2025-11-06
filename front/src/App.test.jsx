import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock all page components
jest.mock('./components/Header', () => {
  return function Header() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('./pages/LoginPage', () => {
  return function LoginPage() {
    return <div>LoginPage</div>;
  };
});

jest.mock('./pages/InitialPage', () => {
  return function InitialPage() {
    return <div>InitialPage</div>;
  };
});

jest.mock('./pages/SignupPage', () => {
  return function SignupPage() {
    return <div>SignupPage</div>;
  };
});

jest.mock('./pages/LockSelectPage', () => {
  return function LockSelectPage() {
    return <div>LockSelectPage</div>;
  };
});

jest.mock('./pages/HomePage', () => {
  return function HomePage() {
    return <div>HomePage</div>;
  };
});

jest.mock('./pages/LockControlPage', () => {
  return function LockControlPage() {
    return <div>LockControlPage</div>;
  };
});

jest.mock('./pages/RegisterLockPage', () => {
  return function RegisterLockPage() {
    return <div>RegisterLockPage</div>;
  };
});

jest.mock('./pages/JoinLockPage', () => {
  return function JoinLockPage() {
    return <div>JoinLockPage</div>;
  };
});

jest.mock('./pages/LogsPage', () => {
  return function LogsPage() {
    return <div>LogsPage</div>;
  };
});

jest.mock('./pages/UsersPage', () => {
  return function UsersPage() {
    return <div>UsersPage</div>;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders InitialPage on root path', () => {
    window.history.pushState({}, 'Test page', '/');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('InitialPage')).toBeInTheDocument();
  });
});

