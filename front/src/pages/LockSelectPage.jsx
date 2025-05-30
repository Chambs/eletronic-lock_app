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
        const resp = await axios.post('http://localhost:3003/locks',{email: localStorage.getItem('email')});
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
    navigate(`/home/${registrationCode}`); // Redireciona para /home/:cod
  };

  const handleRegisterAdmin = () => {
    navigate('/register-lock');
  }

  const handleRegisterAsGuest = () => {
    navigate('/join-lock');
  }

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('code');
    navigate('/');
  }

  return (
    <div className="page">
      <h1>Eletronic Lock App</h1>
      
      <div className="button-container" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          style={{
            flex: 1,
            height: '10vh', // 10% da altura da tela
            fontSize: '16px',
            backgroundColor: '#4CAF50', // Cor de fundo para o botão de admin
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => handleRegisterAdmin()}
        >
          Cadastrar como admin de uma nova fechadura
        </button>
        <button
          style={{
            flex: 1,
            height: '10vh', // 10% da altura da tela
            fontSize: '16px',
            backgroundColor: '#2196F3', // Cor de fundo para o botão de usuário convidado
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => handleRegisterAsGuest()}
        >
          Entrar como convidado de uma fechadura já existente
        </button>
      </div>


      {loading ? (
          <p>Carregando...</p>
        ) : locks.length === 0 ? (
          <p>Nenhuma fechadura cadastrada ainda.</p>
        ) : (
          <div className="locks-grid-container">
            {locks.map((lock, idx) => (
              <div key={idx} className="lock-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, color:'#3B3B3B' }}>
                  <div>
                    <b>Nome da Fechadura:</b> {lock.lockName}
                  </div>
                  <div>
                    <b>Código de Registro:</b> {lock.registrationCode}
                  </div>
                  <div>
                    <b>Função:</b> {lock.isAdmin?"Admin":"Convidado"}
                  </div>
                  <button onClick={() => handleNavigate(lock.registrationCode)}>Entrar</button>
                </div>
              </div>
            ))}
          </div>
        )}

      <button className="page-button" onClick={handleLogout} style={{ backgroundColor: '#e57373', color: '#fff' }}>Sair</button>

    </div>
  );
}

export default LockSelectPage;
