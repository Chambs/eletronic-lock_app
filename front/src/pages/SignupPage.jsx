import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/users', { name, email });
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro no cadastro. Tente novamente.');
    }
  }

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Cadastrar Usuário</h2>
        <input
          type="text"
          placeholder="Nome"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Cadastrar</button>
      </form>
    </div>
  );
}

export default SignupPage;
