import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('code', 'TEST123');
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  it('renders without crashing', () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  });

  it('fetches and displays lock status', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Open' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('fetches and displays invite code', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Código de convite: INV123/)).toBeInTheDocument();
    });
  });

  it('displays all navigation buttons', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Controle da Fechadura')).toBeInTheDocument();
      expect(screen.getByText('Histórico de Logs')).toBeInTheDocument();
      expect(screen.getByText('Usuários')).toBeInTheDocument();
      expect(screen.getByText('DESCONECTAR')).toBeInTheDocument();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });
  });

  it('navigates to lock control page', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const controlButton = screen.getByText('Controle da Fechadura');
      fireEvent.click(controlButton);
      expect(mockNavigate).toHaveBeenCalledWith('/lock-control');
    });
  });

  it('navigates to logs page', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const logsButton = screen.getByText('Histórico de Logs');
      fireEvent.click(logsButton);
      expect(mockNavigate).toHaveBeenCalledWith('/logs');
    });
  });

  it('navigates to users page', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const usersButton = screen.getByText('Usuários');
      fireEvent.click(usersButton);
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('handles remove access with confirmation', async () => {
    global.confirm.mockReturnValue(true);
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.resolve({ data: { status: 'Closed' } });
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const disconnectButton = screen.getByText('DESCONECTAR');
      fireEvent.click(disconnectButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/locks/remove-user-access', {
        email: 'test@example.com',
        code: 'TEST123'
      });
      expect(global.alert).toHaveBeenCalledWith('Acesso removido com sucesso.');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('displays error message on status fetch failure', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('status')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('invite-code')) {
        return Promise.resolve({ data: { inviteCode: 'INV123' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Desconhecido')).toBeInTheDocument();
    });
  });
});

