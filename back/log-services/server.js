const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const eventBus = require('../shared-bus/eventBus');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use('/logs', routes);

eventBus.on('USER_EMAIL_UPDATED', ({ oldEmail, newEmail }) => {
  logs.forEach(log => {
    if (log.user === oldEmail) {
      log.user = newEmail;
    }
  });
  saveLogsToFile();
});

app.listen(PORT, () => {
  console.log(`LogService is running on http://localhost:${PORT}`);
});
