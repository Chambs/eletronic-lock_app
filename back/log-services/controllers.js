const logs = require('./logs');

function createLog(req, res) {
  const { user, action } = req.body;

  if (!user || !action) {
    return res.status(400).json({ error: 'User and action are required.' });
  }

  const newLog = {
    user,
    action,
    timestamp: new Date()
  };

  logs.addLog(newLog);

  res.status(201).json(newLog);
}

function getLogs(req, res) {
  const { code } = req.query;
  res.json(logs.getLogsByCode(code));
}

function resetLogs(req, res) {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Código é obrigatório.' });
  }
  logs.resetLogsByCode(code);
  res.json({ message: 'Logs resetados.' });
}

module.exports = {
  getLogs,
  createLog,
  resetLogs
};
