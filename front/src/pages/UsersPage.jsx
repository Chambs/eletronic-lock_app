import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userIcon from '../assets/user-icon.png';
import './PageStyles.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const loggedEmail = localStorage.getItem('email');
  const code = localStorage.getItem('code');
  const currentUser = users.find(u => u.email === loggedEmail);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const resp = await axios.get(`/api/users/?code=${code}`);
      setUsers(resp.data);
    } catch {
      setUsers([]);
      alert('Erro ao buscar usuários.');
    }
    setLoading(false);
  }

  async function handleRemoveUser(email) {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(
          `/api/locks/locks/${localStorage.getItem('code')}/invitee/${email}?requester=${loggedEmail}`
        );
        alert("Usuário removido!");
        fetchUsers();
      } catch (e) {
        alert("Erro ao remover usuário.");
      }
    }
  }

  async function handleRoleChange(email, newRole) {
    try {
      await axios.post('/api/users/update-role', {
        email,
        code,
        newRole,
        requesterEmail: loggedEmail
      });
      alert('Role atualizada com sucesso!');
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao atualizar role.');
    }
  }

  function openEdit(user) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, password: '', role: user.role || 'guest' });
    setSelectedImage(null);
    setError('');
  }

  function closeEdit() {
    setEditingUser(null);
    setEditForm({ name: '', email: '', password: '', role: 'guest' });
    setSelectedImage(null);
    setError('');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setSelectedImage(file);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getImageUrl(user) {
    if (editingUser && selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    if (user.profileImage) {
      return `/api/uploads/${user.profileImage}`;
    }
    return userIcon;
  }

  async function handleEditSave() {
    if (!editForm.name.trim()) {
      setError('Nome não pode ser vazio.');
      return;
    }
    if (!isValidEmail(editForm.email)) {
      setError('E-mail inválido.');
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      // Update user profile
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('password', editForm.password);
      formData.append('currentUser', loggedEmail);
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      await axios.put(`/api/users/${editingUser.email}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update role if changed and user is admin
      if (isAdmin && editingUser.email !== loggedEmail && editForm.role !== editingUser.role) {
        await axios.post('/api/users/update-role', {
          email: editingUser.email,
          code,
          newRole: editForm.role,
          requesterEmail: loggedEmail
        });
      }

      closeEdit();
      fetchUsers();
      localStorage.setItem('user', editForm.name);
      localStorage.setItem('email', editForm.email);
      alert('Usuário atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar usuário.');
    }
  }

  return (
    <div className="page">
      <h1>Usuários Cadastrados</h1>
      <button className="page-button" style={{ marginBottom: 24 }} onClick={() => navigate(`/home/${code}`)}>Voltar</button>
      {loading ? (
        <p>Carregando...</p>
      ) : users.length === 0 ? (
        <p>Nenhum usuário cadastrado ainda.</p>
      ) : (
        <div className="users-grid-container">
          {users.map((user, idx) => (
            <div key={idx} className="user-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={user.profileImage ? `/api/uploads/${user.profileImage}` : userIcon}
                alt="Ícone de usuário"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #CCC',
                  marginRight: 12
                }}
              />
              <div style={{ flex: 1, color: '#3B3B3B' }}>
                <div>
                  <b>Nome:</b> {user.name}
                </div>
                <div>
                  <b>Email:</b> {user.email}
                </div>
                <div>
                  <b>Função:</b>{' '}
                  <span>
                    {user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'User' : 'Convidado'}
                  </span>
                </div>
                {isAdmin && user.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="page-button"
                      style={{ padding: "4px 16px", fontSize: 14, backgroundColor: '#e57373', color: '#fff' }}
                      onClick={() => handleRemoveUser(user.email)}
                    >
                      Excluir
                    </button>
                    <button
                      className="page-button"
                      style={{ padding: "4px 16px", fontSize: 14 }}
                      onClick={() => openEdit(user)}
                    >
                      Editar
                    </button>
                  </div>
                )}

                {user.email === loggedEmail && user.name === localStorage.getItem('user') && !(isAdmin && user.role !== 'admin') && (
                  <button
                    className="page-button"
                    style={{ marginTop: 12, padding: "4px 16px", fontSize: 14 }}
                    onClick={() => openEdit(user)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="update-label">Editar Usuário</h2>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <img
                src={getImageUrl(editingUser)}
                alt="Foto de perfil"
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  border: '2px solid #CCC', objectFit: 'cover'
                }}
              /><br />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ marginTop: 8 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Nome:<br />
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  autoFocus
                />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="update-label">Email:<br />
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Senha:<br />
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleChange}
                  placeholder="Nova senha (opcional)"
                />
              </label>
            </div>
            {isAdmin && editingUser.email !== loggedEmail && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: '#333' }}>Função:<br />
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #CCC',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      color: 'black'
                    }}
                  >
                    <option value="admin" style={{ color: '#333' }}>Admin</option>
                    <option value="user" style={{ color: '#333' }}>User</option>
                    <option value="guest" style={{ color: '#333' }}>Convidado</option>
                  </select>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#555' }}>
                    Selecionado: {editForm.role === 'admin' ? 'Admin' : editForm.role === 'user' ? 'User' : 'Convidado'}
                  </div>
                </label>
              </div>
            )}
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <button className="update-button" style={{ marginBottom: 5 }} onClick={handleEditSave}>Salvar</button>
            <button className="update-button" onClick={closeEdit}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
