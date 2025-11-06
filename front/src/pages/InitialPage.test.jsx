import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InitialPage from './InitialPage';

describe('InitialPage Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <InitialPage />
      </BrowserRouter>
    );
  });

  it('renders page title', () => {
    render(
      <BrowserRouter>
        <InitialPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Eletronic Lock App')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <BrowserRouter>
        <InitialPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Controle sua fechadura eletrônica de forma prática e segura!')).toBeInTheDocument();
  });

  it('renders Sign in link', () => {
    render(
      <BrowserRouter>
        <InitialPage />
      </BrowserRouter>
    );
    
    const signInLink = screen.getByText('Sign in');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders lock icon image', () => {
    render(
      <BrowserRouter>
        <InitialPage />
      </BrowserRouter>
    );
    
    const lockImage = screen.getByAltText('Lock Icon');
    expect(lockImage).toBeInTheDocument();
  });
});

