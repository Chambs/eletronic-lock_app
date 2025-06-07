import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LockSelectPage() {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const resp = await axios.post('http://localhost:3003/locks', { email: localStorage.getItem('email') });
        setLocks(resp.data.list);
      } catch {
        setLocks([]);
        alert('Erro ao buscar fechaduras.');
      }
      setLoading(false);
    }
    fetchStatus();
  }, []);

  const handleNavigate = (registrationCode) => {
    localStorage.setItem('code', registrationCode);
    navigate(`/home/${registrationCode}`);
  };

  const handleRegisterAdmin = () => {
    navigate('/register-lock');
  };

  const handleRegisterAsGuest = () => {
    navigate('/join-lock');
  };

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('code');
    navigate('/');
  }

  return (
    <div className="page">
      
      <div className="lockselect-actions">
        <button className="button-home lockselect-action"
          style={{ backgroundColor: '#4CAF50' }}
          onClick={handleRegisterAdmin}
        >
          Cadastrar nova fechadura
        </button>
        <button className="button-home lockselect-action"
          style={{ backgroundColor: '#2196F3' }}
          onClick={handleRegisterAsGuest}
        >
          Entrar como convidado
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : locks.length === 0 ? (
        <p>Nenhuma fechadura cadastrada ainda.</p>
      ) : (
        <div className="locks-grid-container">
          {locks.map((lock, idx) => (
            <div key={idx} className="lock-card lock-card-modern">
              <div className="lock-icon-card">
                <span role="img" aria-label="cadeado" style={{ fontSize: 40 }}>
                  {lock.isAdmin ? "🔑" : "👤"}
                </span>
              </div>
              <div style={{ flex: 1, color: '#3B3B3B' }}>
                <div><b>Nome:</b> {lock.lockName}</div>
                <div><b>Função:</b> {lock.isAdmin ? <span className="badge-admin">Admin</span> : <span className="badge-guest">Convidado</span>}</div>
              </div>
              <button className="enter-lock-btn" onClick={() => handleNavigate(lock.registrationCode)}>Entrar</button>
            </div>
          ))}
        </div>
      )}

      <button className="page-button" onClick={handleLogout} style={{ backgroundColor: '#e57373', color: '#fff', marginTop: 30 }}>Sair</button>
    </div>
  );
}

export default LockSelectPage;
