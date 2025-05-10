const users = require('./users');
const eventBus = require('../shared-bus/eventBus');

function getUsers(req, res) {
  res.json(users.getAll());
}

function createUser(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  users.addUser({ name, email });

  res.status(201).json({ message: 'User created successfully.' });
}

function lockAction(req, res) {
  const { user, action } = req.body;

  if (!user || !action) {
    return res.status(400).json({ error: 'User and action are required.' });
  }

  eventBus.emit('LOCK_ACTION', { user, action });
  console.log(`Evento LOCK_ACTION emitido pelo user-service:`, { user, action });

  res.status(200).json({ message: 'Ação registrada com sucesso.' });
}

module.exports = {
  getUsers,
  createUser,
  lockAction,
};
