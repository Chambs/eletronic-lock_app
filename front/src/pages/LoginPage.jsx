import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
  
    try {
      const response = await axios.get('http://localhost:3001/users');
      const users = response.data;
  
      const userFound = users.find((user) => user.email === email);
  
      if (userFound) {
        alert('Login realizado com sucesso!');
        localStorage.setItem('user', userFound.name);
        navigate('/home');
      } else {
        alert('Usuário não encontrado!');
      }
  
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro no login. Tente novamente.');
    }
  }  

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;
