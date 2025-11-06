import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function HomePage() {
  const [lockStatus, setLockStatus] = useState('Closed');
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const resp = await axios.get(`/api/locks/status?code=${localStorage.getItem('code')}`);
        setLockStatus(resp.data.status);
      } catch {
        setLockStatus('Desconhecido');
      }
    }
    fetchStatus();
  }, []);

  useEffect(() => {
    async function returnInviteCode() {
      try {
        const resp = await axios.get(`/api/locks/invite-code?code=${localStorage.getItem('code')}`);
        setInviteCode(resp.data.inviteCode);
      } catch {
        setInviteCode("[Erro ao buscar código de convite]");
      }
      return inviteCode || "[Erro]";
    }
    returnInviteCode();
  }, []);


const [users, setUsers] = useState([]);
const loggedEmail = localStorage.getItem('email');
const code = localStorage.getItem('code');
const currentUser = users.find(u => u.email === loggedEmail);
const userRole = currentUser?.role || 'guest';
const isAdmin = userRole === 'admin';
const canViewLogs = userRole === 'admin' || userRole === 'user';
const canManageUsers = userRole === 'admin';

useEffect(() => {
  async function fetchUsers() {
    try {
      const resp = await axios.get(`/api/users/?code=${code}`);
      console.log('Users loaded:', resp.data);
      setUsers(resp.data);
      const current = resp.data.find(u => u.email === loggedEmail);
      console.log('Current user:', current);
      console.log('Current user role:', current?.role);
    } catch {
      setUsers([]);
    }
  }
  fetchUsers();
}, [code, loggedEmail]);

  async function handleRemoveAccess() {
    const confirmMessage = isAdmin
      ? "Você é o administrador. Remover seu acesso desconectará todos os usuários e apagará os logs. Deseja continuar?"
      : "Tem certeza que deseja remover seu acesso a esta fechadura?";

    if (window.confirm(confirmMessage)) {
      try {
        await axios.post('/api/locks/remove-user-access', {
          email: localStorage.getItem('email'),
          code: localStorage.getItem('code')
        });


        alert("Acesso removido com sucesso.");
        localStorage.removeItem('code');
        navigate('/home');
      } catch (e) {
        alert("Erro ao remover acesso.");
        console.error(e);
      }
    }
  }



  function goToControl() {
    navigate('/lock-control');
  }

  function goToLogs() {
    navigate('/logs');
  }

  function goToUsers() {
    navigate('/users');
  }

  function goToSelect() {
    navigate('/home');
  }

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'user') return 'User';
    return 'Convidado';
  };

  return (
    <div className="page">
      <div style={{
        marginBottom: '20px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: '#FFF',
        backgroundColor: '#2c3e50',
        padding: '10px',
        borderRadius: '8px'
      }}>
        Sua função: <span style={{ color: userRole === 'admin' ? '#4CAF50' : userRole === 'user' ? '#2196F3' : '#FF9800' }}>
          {getRoleLabel()}
        </span>
      </div>

      <div style={{
        marginBottom: '30px',
        fontWeight: 'bold',
        fontSize: '1.3rem'
      }}>
        Status da Fechadura:{" "}
        <span style={{ color: lockStatus === 'Open' ? 'green' : 'red' }}>
          {lockStatus}
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '300px',  
        margin: '0 auto'
      }}>
        <button className="page-button" onClick={goToControl}>Controle da Fechadura</button>
        {canViewLogs && (
          <button className="page-button" onClick={goToLogs}>Histórico de Logs</button>
        )}
        {canManageUsers && (
          <button className="page-button" onClick={goToUsers}>Usuários</button>
        )}
        <button
          className="page-button"
          style={{ backgroundColor: '#b71c1c', color: '#fff' }}
          onClick={handleRemoveAccess}
        >
          DESCONECTAR
        </button>
        {isAdmin && (
          <h2 style={{ color: '#FFF', backgroundImage: 'linear-gradient(to top,rgb(72, 110, 185),rgb(29, 66, 139))', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'inline-block' }}>
            {"Código de convite: " + inviteCode}
          </h2>
        )}
        <button className="page-button" onClick={goToSelect} style={{ backgroundColor: '#e57373', color: '#fff' }}>Voltar</button>
      </div>
    </div>
  );
}

export default HomePage;
