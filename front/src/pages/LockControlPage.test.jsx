import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LockControlPage from './LockControlPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LockControlPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', 'John Doe');
    localStorage.setItem('code', 'TEST123');
    global.alert = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Controle da Fechadura')).toBeInTheDocument();
  });

  it('displays logged user name', () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Usuário logado: John Doe')).toBeInTheDocument();
  });

  it('fetches and displays lock status', async () => {
    axios.get.mockResolvedValue({ data: { status: 'Open' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('displays control buttons', () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('ABRIR')).toBeInTheDocument();
    expect(screen.getByText('FECHAR')).toBeInTheDocument();
    expect(screen.getByText('Voltar')).toBeInTheDocument();
  });

  it('handles open lock action', async () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    const openButton = screen.getByText('ABRIR');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users/lock-actions', {
        user: 'John Doe',
        action: 'ABRIR',
        code: 'TEST123'
      });
      expect(axios.post).toHaveBeenCalledWith('/api/locks/status', {
        status: 'Open',
        code: 'TEST123'
      });
    });
  });

  it('handles close lock action', async () => {
    axios.get.mockResolvedValue({ data: { status: 'Open' } });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    const closeButton = screen.getByText('FECHAR');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users/lock-actions', {
        user: 'John Doe',
        action: 'FECHAR',
        code: 'TEST123'
      });
      expect(axios.post).toHaveBeenCalledWith('/api/locks/status', {
        status: 'Closed',
        code: 'TEST123'
      });
    });
  });

  it('displays alert on action error', async () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    axios.post.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    const openButton = screen.getByText('ABRIR');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao controlar a fechadura.');
    });
  });

  it('navigates back on Voltar button click', () => {
    axios.get.mockResolvedValue({ data: { status: 'Closed' } });
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/home/TEST123');
  });

  it('displays Desconhecido on fetch error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LockControlPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Desconhecido')).toBeInTheDocument();
    });
  });
});

