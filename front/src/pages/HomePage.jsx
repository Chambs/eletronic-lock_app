import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function HomePage() {
  const [lockStatus, setLockStatus] = useState('Fechada');
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const resp = await axios.get(`http://localhost:3003/status?code=${localStorage.getItem('code')}`);
        setLockStatus(resp.data.status);
      } catch {
        setLockStatus('Desconhecido');
      }
    }
    fetchStatus();
  }, []);

    useEffect(() => {
    async function returnInviteCode(){
        try {
          const resp = await axios.get(`http://localhost:3003/invite-code?code=${localStorage.getItem('code')}`);
          setInviteCode(resp.data.inviteCode);
        } catch {
          setInviteCode("[Erro ao buscar código de convite]");
        }
        return inviteCode || "[Erro]";
    }
    returnInviteCode();
  }, []);

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
        <h2 style={{ color: '#FFF', backgroundImage: 'linear-gradient(to top,rgb(72, 110, 185),rgb(29, 66, 139))', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'inline-block' }}>
          {"Código de convite: "+inviteCode}
        </h2>
        <button className="page-button" onClick={goToSelect} style={{ backgroundColor: '#e57373', color: '#fff' }}>Voltar</button>
      </div>
    </div>
  );
}

export default HomePage;
