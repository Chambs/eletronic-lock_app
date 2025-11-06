import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LogsPage from './LogsPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LogsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('code', 'TEST123');
    global.alert = jest.fn();
  });

  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Histórico de Ações da Fechadura')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays message when no logs are available', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma ação registrada.')).toBeInTheDocument();
    });
  });

  it('fetches and displays logs', async () => {
    const mockLogs = [
      {
        user: 'John Doe',
        action: 'ABRIR',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        user: 'Jane Smith',
        action: 'FECHAR',
        timestamp: '2024-01-15T09:00:00Z'
      }
    ];
    axios.get.mockResolvedValue({ data: mockLogs });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText(/ABRIR/)).toBeInTheDocument();
      expect(screen.getByText(/FECHAR/)).toBeInTheDocument();
    });
  });

  it('sorts logs by timestamp descending', async () => {
    const mockLogs = [
      {
        user: 'User1',
        action: 'ABRIR',
        timestamp: '2024-01-15T09:00:00Z'
      },
      {
        user: 'User2',
        action: 'FECHAR',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ];
    axios.get.mockResolvedValue({ data: mockLogs });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/logs/?code=TEST123');
    });
  });

  it('navigates back on Voltar button click', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByText('Voltar');
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/home/TEST123');
    });
  });

  it('displays alert on fetch error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao buscar logs.');
      expect(screen.getByText('Nenhuma ação registrada.')).toBeInTheDocument();
    });
  });

  it('formats timestamps correctly', async () => {
    const mockLogs = [
      {
        user: 'John Doe',
        action: 'ABRIR',
        timestamp: '2024-01-15T10:30:00.000Z'
      }
    ];
    axios.get.mockResolvedValue({ data: mockLogs });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const formattedDate = new Date('2024-01-15T10:30:00.000Z').toLocaleString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it('displays multiple logs in grid container', async () => {
    const mockLogs = [
      { user: 'User1', action: 'ABRIR', timestamp: '2024-01-15T10:30:00Z' },
      { user: 'User2', action: 'FECHAR', timestamp: '2024-01-15T09:00:00Z' },
      { user: 'User3', action: 'ABRIR', timestamp: '2024-01-15T08:00:00Z' }
    ];
    axios.get.mockResolvedValue({ data: mockLogs });
    
    render(
      <BrowserRouter>
        <LogsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const logCards = screen.getAllByText(/realizou ação/);
      expect(logCards).toHaveLength(3);
    });
  });
});

