const express = require('express');
const logs = require('./logs');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(logs.getAll());
});

router.post('/', (req, res) => {
  const { user, action, timestamp } = req.body;

  if (!user || !action || !timestamp) {
    return res.status(400).json({ error: 'User, action, and timestamp are required.' });
  }

  logs.addLog({ user, action, timestamp });
  console.log(`Log registrado: ${user} fez ${action} em ${timestamp}`);

  res.status(201).json({ message: 'Log registrado com sucesso.' });
});

module.exports = router;
