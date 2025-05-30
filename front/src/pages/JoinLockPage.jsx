import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function JoinLockPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3003/join', { code:code, email:localStorage.getItem('email') } );

      try{
        await axios.post('http://localhost:3001/users/join', { email: localStorage.getItem('email'), code: response.data.registrationCode });
      }catch(error){
        setError(error.response.data.error);
      }

      alert(response.data.message);
      navigate('/home');
    } catch (err) {
      setError(err.response.data.error);
    }

  }

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar como convidado de uma fechadura</h2>
        <input
          type="password"
          className="input-field"
          placeholder="Código de convite da fechadura"
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

export default JoinLockPage;
