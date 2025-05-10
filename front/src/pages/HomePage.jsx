import { useNavigate } from 'react-router-dom';
import './PageStyles.css';

function ProtectedHomePage() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate('/');
  }

  function goToControl() {
    navigate('/lock-control');
  }

  return (
    <div className="page">
      <h1>Acesso liberado!</h1>

      <div style={{ margin: '20px' }}>
        <button className="page-button" onClick={goToControl}>Controle da Fechadura</button>
        <button className="page-button" onClick={handleLogout} style={{ marginLeft: '10px' }}>Sair</button>
      </div>
    </div>
  );
}

export default ProtectedHomePage;
