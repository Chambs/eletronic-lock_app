import './PageStyles.css';

function ProtectedHomePage() {
  return (
    <div className="page">
      <h1>Acesso liberado!!</h1>
      <p>Você está logado.</p>
    </div>
  );
}

export default ProtectedHomePage;
