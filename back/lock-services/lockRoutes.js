const express = require('express');
const { getStatus, setStatus } = require('./lockStatus');
const eventBus = require('../shared-bus/eventBus');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: getStatus() });
});

router.post('/status', (req, res) => {
  const { status } = req.body;
  if (status !== 'Aberta' && status !== 'Fechada') {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  setStatus(status);
  res.json({ status: getStatus() });
});

router.get('/status-events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  const sendStatus = (status) => {
    res.write(`data: ${JSON.stringify({ status })}\n\n`);
  };

  sendStatus(getStatus());

  const listener = (status) => sendStatus(status);
  eventBus.on('statusChanged', listener);

  req.on('close', () => eventBus.off('statusChanged', listener));
});

module.exports = router;
