import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import SignupPage from './SignupPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignupPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  it('renders signup form', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cadastrar Usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar Senha')).toBeInTheDocument();
  });

  it('updates form inputs', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('validates empty name', async () => {
    const { container } = render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório.')).toBeInTheDocument();
    });
  });

  it('validates invalid email', async () => {
    const { container } = render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Email inválido.')).toBeInTheDocument();
    });
  });

  it('validates short password', async () => {
    const { container } = render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  it('validates password mismatch', async () => {
    const { container } = render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
    });
  });

  it('handles successful signup', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Success' } });

    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users/', {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(global.alert).toHaveBeenCalledWith('Cadastro realizado com sucesso!');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays error on failed signup', async () => {
    axios.post.mockRejectedValue({ 
      response: { data: { error: 'Email já cadastrado' } } 
    });

    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Nome');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar Senha');
    const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
    });
  });

  it('navigates to login page when clicking "Já tem conta? Entrar"', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByText('Já tem conta? Entrar');
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

