import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function HomePage() {
  const [lockStatus, setLockStatus] = useState('Fechada');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const resp = await axios.get('http://localhost:3003/status');
        setLockStatus(resp.data.status);
      } catch {
        setLockStatus('Desconhecido');
      }
    }
    fetchStatus();
  }, []);
  

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/');
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

  return (
    <div className="page">
      <h1>Eletronic Lock App</h1>
      <div style={{
        marginBottom: '30px',
        fontWeight: 'bold',
        fontSize: '1.3rem'
      }}>
        Status da Fechadura:{" "}
        <span style={{ color: lockStatus === 'Aberta' ? 'green' : 'red' }}>
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
        <button className="page-button" onClick={goToLogs}>Histórico de Logs</button>
        <button className="page-button" onClick={goToUsers}>Usuários</button>
        <button className="page-button" onClick={handleLogout} style={{ backgroundColor: '#e57373', color: '#fff' }}>Sair</button>
      </div>
    </div>
  );
}

export default HomePage;
