const users = require('./users');
const axios = require('axios');
const LOG_SERVICE_URL = 'http://localhost:3002/logs';
const { getAll, findByEmail, emailExists, addUser, findUsersByCode, addAdminCodeToUser, addNonAdminCodeToUser } = require('./users');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getUsers(req, res) {
  const { code } = req.query;
  res.json(findUsersByCode(code));
}

function createUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (findByEmail(email)) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }

  addUser({ name, email, password });
  res.status(201).json({ message: 'User created successfully.' });
}

async function lockAction(req, res) {
  const { user, action, code } = req.body;
  if (!user || !action) {
    return res.status(400).json({ error: 'User and action are required.' });
  }

  try {
    await axios.post(LOG_SERVICE_URL, {
      user,
      action,
      code,
      timestamp: new Date()
    });
    res.status(200).json({ message: 'Ação registrada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar ação no LogService.' });
  }
}

async function updateUser(req, res) {
  const email = req.params.email;
  const { name, email: newEmail, password } = req.body;
  let profileImage = req.file ? req.file.filename : undefined;

  const user = users.getUser(email);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  if (name) user.name = name;
  if (password) user.password = password;
  if (profileImage) user.profileImage = profileImage;

  if (newEmail && newEmail !== email) {
    if (users.getUser(newEmail)) {
      return res.status(409).json({ error: 'Já existe um usuário com esse e-mail.' });
    }

    users.updateEmail(email, newEmail);

    const resp = await axios.post('http://localhost:3003/update-email',{ email: email, newEmail: newEmail });

    return res.json({ message: 'Usuário atualizado com sucesso!', user });
  }

  users.updateUser(email, user);
  res.json({ message: 'Usuário atualizado com sucesso!', user });
}

async function deleteUser(req, res) {
  const { email } = req.params;
  const requester = req.body.requester; 

  const userToDelete = users.getUser(email);
  const requestingUser = users.getUser(requester);

  if (!userToDelete) return res.status(404).json({ error: 'Usuário não encontrado' });

  if (!requestingUser) return res.status(403).json({ error: 'Operação não permitida.' });
  const isSelf = requester === email;
  const isAdmin = requestingUser.isAdmin; 

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Você não tem permissão para excluir este usuário.' });
  }

  users.deleteUser(email);

  try {
    await axios.post('http://localhost:3003/remove-user-access', { email });
  } catch (e) {
    console.error('Erro ao remover acessos:', e.message);
  }

  res.json({ message: 'Usuário removido com sucesso.' });
}

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = users.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  res.json({ message: 'Login successful', name: user.name, email: user.email, profileImage: user.profileImage });
}

function register(req, res) { 
  const { email, code } = req.body;
  addAdminCodeToUser(email, code);
  res.json({ message: 'User registred' });
}

function join(req, res) { 
  const { email, code } = req.body;
  addNonAdminCodeToUser(email, code);
  res.json({ message: 'Join successful' });
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  lockAction,
  login,
  upload,
  register,
  join
};
