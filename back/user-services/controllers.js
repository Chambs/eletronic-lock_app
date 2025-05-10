const users = require('./users');
const axios = require('axios');  
const LOG_SERVICE_URL = 'http://localhost:3002/logs'; 

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

async function lockAction(req, res) {
  const { user, action } = req.body;

  if (!user || !action) {
    return res.status(400).json({ error: 'User and action are required.' });
  }

  try {
    await axios.post(LOG_SERVICE_URL, {
      user,
      action,
      timestamp: new Date()
    });

    console.log(`Ação enviada ao LogService: { user: ${user}, action: ${action} }`);
    res.status(200).json({ message: 'Ação registrada com sucesso.' });

  } catch (error) {
    console.error('Erro ao enviar para LogService:', error.message);
    res.status(500).json({ error: 'Erro ao registrar ação no LogService.' });
  }
}

module.exports = {
  getUsers,
  createUser,
  lockAction,
};
