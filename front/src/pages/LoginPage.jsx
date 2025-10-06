import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('user', response.data.name);
      localStorage.setItem('email', response.data.email);
      navigate('/home');
    } catch (err) {
      setError('Email ou senha inválidos.');
    }
  }

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Entrar</button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </form>
      <button className="change-button" style={{ marginTop: 16 }} onClick={() => navigate('/signup')}>
        Criar conta
      </button>
    </div>
  );
}

export default LoginPage;
