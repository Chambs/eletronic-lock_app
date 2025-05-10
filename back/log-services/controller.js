const logs = require('./logs');

function getLogs(req, res) {
  res.json(logs.getLogs());
}

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

module.exports = {
  getLogs,
  createLog
};
