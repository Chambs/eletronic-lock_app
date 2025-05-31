const express = require('express');
const logs = require('./logs');

const router = express.Router();

router.get('/', (req, res) => {
  const { code } = req.query;
  res.json(logs.getLogsByCode(code));
});

router.post('/', (req, res) => {
  const { user, action, code, timestamp } = req.body;

  if (!user || !action || !timestamp) {
    return res.status(400).json({ error: 'User, action, and timestamp are required.' });
  }

  logs.addOrCreateLog(code, { user, action, timestamp });

  res.status(201).json({ message: 'Log registrado com sucesso.' });
});

router.post('/join', (req, res) => {
  const { user, email, timestamp, code } = req.body;

  logs.addOrCreateLog(code, { user, action:"entrou como convidado", timestamp });

  res.status(201).json({ message: 'Log registrado com sucesso.' });
});

module.exports = router;
