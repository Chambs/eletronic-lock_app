import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PageStyles.css';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const resp = await axios.get(`/api/logs/?code=${localStorage.getItem('code')}`);
      setLogs(resp.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      setLogs([]);
      alert('Erro ao buscar logs.');
    }
    setLoading(false);
  }

  return (
    <div className="page">
      <h1>Histórico de Ações da Fechadura</h1>
      <button className="page-button" style={{ marginBottom: 24 }} onClick={() => navigate(`/home/${localStorage.getItem('code')}`)}>Voltar</button>
      {loading ? (
        <p>Carregando...</p>
      ) : logs.length === 0 ? (
        <p>Nenhuma ação registrada.</p>
      ) : (
        <div className="logs-grid-container">
          {logs.map((log, idx) => (
            <div key={idx} className="log-card">
              <div style={{ color:'#666' }}>
                <b>{log.user}</b> realizou ação <b>{log.action}</b>
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LogsPage;
