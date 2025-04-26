import { useState } from 'react';
import './PageStyles.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Tentando logar com:', email);
  }

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;
