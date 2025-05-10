const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logs = require('./logs');
const eventBus = require('../shared-bus/eventBus');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use('/logs', routes);

app.listen(PORT, () => {
  console.log(`LogService is running on http://localhost:${PORT}`);
});

eventBus.on('LOCK_ACTION', (data) => {
  console.log('LOCK_ACTION recebido no LogService:', data);

  const logEntry = {
    user: data.user,
    action: data.action,
    timestamp: new Date()
  };

  logs.addLog(logEntry);
});
