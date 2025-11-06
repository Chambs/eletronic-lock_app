import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import RegisterLockPage from './RegisterLockPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterLockPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'test@example.com');
    global.alert = jest.fn();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cadastrar nova fechadura')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Nome da fechadura')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Código de registro da fechadura')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByText('Voltar')).toBeInTheDocument();
  });

  it('updates form inputs', () => {
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    const nicknameInput = screen.getByPlaceholderText('Nome da fechadura');
    const codeInput = screen.getByPlaceholderText('Código de registro da fechadura');

    fireEvent.change(nicknameInput, { target: { value: 'My Lock' } });
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });
    
    expect(nicknameInput.value).toBe('My Lock');
    expect(codeInput.value).toBe('ABC123');
  });

  it('handles successful registration', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Lock registered successfully' } });
    
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    const nicknameInput = screen.getByPlaceholderText('Nome da fechadura');
    const codeInput = screen.getByPlaceholderText('Código de registro da fechadura');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(nicknameInput, { target: { value: 'My Lock' } });
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/locks/register', {
        code: 'ABC123',
        nickname: 'My Lock',
        admin: 'test@example.com'
      });
      expect(axios.post).toHaveBeenCalledWith('/api/users/register', {
        email: 'test@example.com',
        code: 'ABC123'
      });
      expect(global.alert).toHaveBeenCalledWith('Lock registered successfully');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('displays error on failed registration', async () => {
    axios.post.mockRejectedValue({ 
      response: { data: { error: 'Lock already registered' } } 
    });
    
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    const nicknameInput = screen.getByPlaceholderText('Nome da fechadura');
    const codeInput = screen.getByPlaceholderText('Código de registro da fechadura');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(nicknameInput, { target: { value: 'My Lock' } });
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Lock already registered')).toBeInTheDocument();
    });
  });

  it('navigates back on Voltar button click', () => {
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('requires both fields', () => {
    render(
      <BrowserRouter>
        <RegisterLockPage />
      </BrowserRouter>
    );
    
    const nicknameInput = screen.getByPlaceholderText('Nome da fechadura');
    const codeInput = screen.getByPlaceholderText('Código de registro da fechadura');

    expect(nicknameInput).toBeRequired();
    expect(codeInput).toBeRequired();
  });
});

