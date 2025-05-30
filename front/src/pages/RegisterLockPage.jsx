import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function RegisterLockPage() {
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3003/register', { code:code, nickname:nickname, admin:localStorage.getItem('email') });

      try{
        await axios.post('http://localhost:3001/users/register', { email: localStorage.getItem('email'), code: code });
      }catch(error){
        setError(error.response.data.error);
      }

      alert(response.data.message);
      navigate('/home');
    } catch (err) {
      //err.response?.status === 404 || err.response?.status === 409
      setError(err.response.data.error);
    }

  }

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Cadastrar nova fechadura</h2>
        <input
          type="text"
          className="input-field"
          placeholder="Nome da fechadura"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Código de registro da fechadura"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Cadastrar</button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </form>
      <button className="change-button" style={{ marginTop: 16 }} onClick={() => navigate('/home')}>
        Voltar
      </button>
    </div>
  );
}

export default RegisterLockPage;
