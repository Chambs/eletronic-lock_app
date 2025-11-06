const express = require("express");
const cors = require('cors');
const app = express();
const axios = require('axios');

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/events/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'event-bus' });
});

app.post('/api/events/join', (req, res) => {
    const event = req.body;
    axios.post('http://user-service.electronic-lock-app.svc.cluster.local:3001/api/users/join', event)
        .catch(err => console.error('Error sending to user-service:', err.message));
    axios.post('http://log-service.electronic-lock-app.svc.cluster.local:3002/api/logs/join', event)
        .catch(err => console.error('Error sending to log-service:', err.message));
    res.status(200).send({msg:'ok'});
});

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não estiver sendo testado
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SharedBus is running on http://0.0.0.0:${PORT}`);
  });
}