import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('has correct link paths', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const homeLink = screen.getByText('Home');
    const signInLink = screen.getByText('Sign in');
    const signUpLink = screen.getByText('Sign up');
    
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('applies correct CSS class to header', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(container.querySelector('.header')).toBeInTheDocument();
  });

  it('applies correct CSS class to navigation', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(container.querySelector('.nav')).toBeInTheDocument();
  });
});

