import './PageStyles.css';

function ProtectedHomePage() {
  return (
    <div className="page">
      <h1>Bem-vindo à área protegida!</h1>
      <p>Você está logado e pode acessar funcionalidades exclusivas aqui.</p>
    </div>
  );
}

export default ProtectedHomePage;
