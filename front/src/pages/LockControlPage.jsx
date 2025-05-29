import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LockControlPage() {
  const [status, setStatus] = useState('Carregando...');
  const [user, setUser] = useState(localStorage.getItem('user') || 'Guest');
  const navigate = useNavigate();

  // useEffect(() => {
  //   const evtSource = new EventSource('http://localhost:3003/status-events');
  //   evtSource.onmessage = function(event) {
  //     const { status } = JSON.parse(event.data);
  //     setStatus(status);
  //   };
  //   evtSource.onerror = function() {
  //     evtSource.close();
  //     setStatus('Erro ao obter status');
  //   };
  //   return () => evtSource.close();
  // }, []);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const resp = await axios.get(`http://localhost:3003/status?code=${localStorage.getItem('code')}`);
        setStatus(resp.data.status);
      } catch {
        setStatus('Desconhecido');
      }
    }
    const intervalId = setInterval(fetchStatus, 100);
    return () => clearInterval(intervalId);
  }, []);

  async function handleAction(action) {
    try {
      await axios.post('http://localhost:3001/users/lock-actions', { user, action });
      const novoStatus = action === 'ABRIR' ? 'Aberta' : 'Fechada';
      await axios.post('http://localhost:3003/status', { status: novoStatus, code: localStorage.getItem('code') });
    } catch (error) {
      alert('Erro ao controlar a fechadura.');
    }
  }

  function handleBack() {
    navigate(`/home/${localStorage.getItem('code')}`);
  }

  return (
    <div className="page">
      <h1>Controle da Fechadura</h1>
      <p>Usuário logado: {user}</p>
      <div style={{ fontWeight: 'bold', marginBottom: 15 }}>
        Status atual: <span style={{ color: status === 'Aberta' ? 'green' : 'red' }}>{status}</span>
      </div>
      <div style={{ margin: '20px' }}>
        <button className="page-button" onClick={() => handleAction('ABRIR')}>ABRIR</button>
        <button className="page-button" onClick={() => handleAction('FECHAR')} style={{ marginLeft: '10px' }}>FECHAR</button>
        <button className="page-button" onClick={handleBack} style={{ marginLeft: '10px' }}>Voltar</button>
      </div>
    </div>
  );
}

export default LockControlPage;
