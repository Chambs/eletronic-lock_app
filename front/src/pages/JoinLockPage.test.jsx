import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import JoinLockPage from './JoinLockPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('JoinLockPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'guest@example.com');
    localStorage.setItem('user', 'Guest User');
    global.alert = jest.fn();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Entrar como convidado de uma fechadura')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Código de convite da fechadura')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByText('Voltar')).toBeInTheDocument();
  });

  it('updates code input', () => {
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const codeInput = screen.getByPlaceholderText('Código de convite da fechadura');
    fireEvent.change(codeInput, { target: { value: 'INV123' } });
    
    expect(codeInput.value).toBe('INV123');
  });

  it('handles successful join', async () => {
    axios.post.mockResolvedValue({ 
      data: { 
        message: 'Successfully joined',
        registrationCode: 'REG456'
      } 
    });
    
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const codeInput = screen.getByPlaceholderText('Código de convite da fechadura');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(codeInput, { target: { value: 'INV123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/locks/join', {
        invitationCode: 'INV123',
        email: 'guest@example.com'
      });
      expect(global.alert).toHaveBeenCalledWith('Successfully joined');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('logs event after successful join', async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes('/api/locks/join')) {
        return Promise.resolve({ 
          data: { 
            message: 'Successfully joined',
            registrationCode: 'REG456'
          } 
        });
      }
      return Promise.resolve({ data: { message: 'Event logged' } });
    });
    
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const codeInput = screen.getByPlaceholderText('Código de convite da fechadura');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(codeInput, { target: { value: 'INV123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/events/join', 
        expect.objectContaining({
          invitationCode: 'INV123',
          email: 'guest@example.com',
          user: 'Guest User',
          code: 'REG456'
        })
      );
    });
  });

  it('displays error on failed join', async () => {
    axios.post.mockRejectedValue({ 
      response: { data: { error: 'Invalid invitation code' } } 
    });
    
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const codeInput = screen.getByPlaceholderText('Código de convite da fechadura');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(codeInput, { target: { value: 'INVALID' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid invitation code')).toBeInTheDocument();
    });
  });

  it('navigates back on Voltar button click', () => {
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('requires code field', () => {
    render(
      <BrowserRouter>
        <JoinLockPage />
      </BrowserRouter>
    );
    
    const codeInput = screen.getByPlaceholderText('Código de convite da fechadura');
    expect(codeInput).toBeRequired();
  });
});

