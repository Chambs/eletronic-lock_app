import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LockSelectPage from './LockSelectPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LockSelectPage Component', () => {
  let setItemSpy;
  let removeItemSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'test@example.com');
    global.alert = jest.fn();
    
    // Spy on localStorage methods
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('renders without crashing', () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );
  });

  it('displays loading state initially', () => {
    axios.post.mockImplementation(() => new Promise(() => {}));
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays action buttons', async () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cadastrar nova fechadura')).toBeInTheDocument();
      expect(screen.getByText('Entrar como convidado')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });
  });

  it('displays message when no locks are available', async () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma fechadura cadastrada ainda.')).toBeInTheDocument();
    });
  });

  it('displays list of locks', async () => {
    const mockLocks = [
      { lockName: 'Lock 1', registrationCode: 'CODE1', isAdmin: true },
      { lockName: 'Lock 2', registrationCode: 'CODE2', isAdmin: false }
    ];
    axios.post.mockResolvedValue({ data: { list: mockLocks } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Lock 1')).toBeInTheDocument();
      expect(screen.getByText('Lock 2')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Convidado')).toBeInTheDocument();
    });
  });

  it('navigates to lock page when clicking Entrar', async () => {
    const mockLocks = [
      { lockName: 'Lock 1', registrationCode: 'CODE1', isAdmin: true }
    ];
    axios.post.mockResolvedValue({ data: { list: mockLocks } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Lock 1')).toBeInTheDocument();
    });

    const enterButton = screen.getByText('Entrar');
    fireEvent.click(enterButton);
    
    expect(setItemSpy).toHaveBeenCalledWith('code', 'CODE1');
    expect(mockNavigate).toHaveBeenCalledWith('/home/CODE1');
  });

  it('navigates to register lock page', async () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const registerButton = screen.getByText('Cadastrar nova fechadura');
      fireEvent.click(registerButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register-lock');
    });
  });

  it('navigates to join lock page', async () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const joinButton = screen.getByText('Entrar como convidado');
      fireEvent.click(joinButton);
      expect(mockNavigate).toHaveBeenCalledWith('/join-lock');
    });
  });

  it('handles logout', async () => {
    axios.post.mockResolvedValue({ data: { list: [] } });
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma fechadura cadastrada ainda.')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);
    
    expect(removeItemSpy).toHaveBeenCalledWith('user');
    expect(removeItemSpy).toHaveBeenCalledWith('code');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays alert on fetch error', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LockSelectPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao buscar fechaduras.');
    });
  });
});

