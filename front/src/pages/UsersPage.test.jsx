import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import UsersPage from './UsersPage';

jest.mock('axios');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UsersPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'admin@example.com');
    localStorage.setItem('code', 'TEST123');
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Usuários Cadastrados')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays message when no users are available', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário cadastrado ainda.')).toBeInTheDocument();
    });
  });

  it('fetches and displays users', async () => {
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null },
      { name: 'Guest User', email: 'guest@example.com', isAdmin: false, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Guest User')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    });
  });

  it('displays admin and guest badges', async () => {
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null },
      { name: 'Guest User', email: 'guest@example.com', isAdmin: false, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Admin')).toHaveLength(1);
      expect(screen.getAllByText('Convidado')).toHaveLength(1);
    });
  });

  it('shows Excluir button for non-admin users when logged user is admin', async () => {
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null },
      { name: 'Guest User', email: 'guest@example.com', isAdmin: false, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Excluir')).toBeInTheDocument();
    });
  });

  it('handles user removal with confirmation', async () => {
    global.confirm.mockReturnValue(true);
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null },
      { name: 'Guest User', email: 'guest@example.com', isAdmin: false, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    axios.delete.mockResolvedValue({ data: { message: 'User removed' } });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByText('Excluir');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este usuário?');
      expect(axios.delete).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Usuário removido!');
    });
  });

  it('does not remove user if confirmation is cancelled', async () => {
    global.confirm.mockReturnValue(false);
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null },
      { name: 'Guest User', email: 'guest@example.com', isAdmin: false, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByText('Excluir');
      fireEvent.click(deleteButton);
    });

    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('shows Editar button for logged user', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
  });

  it('opens edit modal when clicking Editar', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);
    });

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha:/)).toBeInTheDocument();
  });

  it('validates name in edit form', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);
    });

    const nameInput = screen.getByLabelText(/Nome:/);
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Nome não pode ser vazio.')).toBeInTheDocument();
    });
  });

  it('validates email in edit form', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);
    });

    const emailInput = screen.getByLabelText(/Email:/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido.')).toBeInTheDocument();
    });
  });

  it('validates password length in edit form', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);
    });

    const passwordInput = screen.getByLabelText(/Senha:/);
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  it('closes edit modal on Cancelar', async () => {
    localStorage.setItem('user', 'Admin User');
    const mockUsers = [
      { name: 'Admin User', email: 'admin@example.com', isAdmin: true, profileImage: null }
    ];
    axios.get.mockResolvedValue({ data: mockUsers });
    
    render(
      <BrowserRouter>
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);
    });

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Editar Usuário')).not.toBeInTheDocument();
  });

  it('navigates back on Voltar button click', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(
      <BrowserRouter>
        <UsersPage />
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
        <UsersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Erro ao buscar usuários.');
    });
  });
});

