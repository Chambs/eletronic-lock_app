import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 importa hook de navegação
import axios from 'axios';
import './PageStyles.css';

function LockControlPage() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem('user') || 'Anônimo';
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
        <button className="page-button" onClick={handleBack} style={{ marginLeft: '10px' }}>Voltar</button> {/* 👈 botão voltar */}
      </div>

      <h2>Histórico de Ações</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            {log.timestamp}: <strong>{log.user}</strong> fez ação <strong>{log.action}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LockControlPage;
