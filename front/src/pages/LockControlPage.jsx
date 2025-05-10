import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LockControlPage() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem('user') || 'Guest';
    setUser(loggedUser);

    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await axios.get('http://localhost:3002/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  }

  async function handleAction(action) {
    try {
      await axios.post('http://localhost:3001/users/lock-actions', {
        user,
        action
      });

      setTimeout(() => {
        fetchLogs();
      }, 300);
    } catch (error) {
      console.error('Erro ao enviar ação:', error);
    }
  }

  function handleBack() {
    navigate('/home');
  }

  return (
    <div className="page">
      <h1>Controle da Fechadura</h1>
      <p>Usuário logado: {user}</p>

      <div style={{ margin: '20px' }}>
        <button className="page-button" onClick={() => handleAction('ABRIR')}>ABRIR</button>
        <button className="page-button" onClick={() => handleAction('FECHAR')} style={{ marginLeft: '10px' }}>FECHAR</button>
        <button className="page-button" onClick={handleBack} style={{ marginLeft: '10px' }}>Voltar</button>
      </div>

      <h2>Histórico de Ações</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            {log.user} realizou ação {log.action} em {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default LockControlPage;
