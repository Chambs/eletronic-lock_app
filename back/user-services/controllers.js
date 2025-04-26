const users = require('./users');

function getUsers(req, res) {
  res.json(users.getAll());
}

function createUser(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newUser = users.add({ name, email });
  res.status(201).json(newUser);
}

module.exports = {
  getUsers,
  createUser,
};
