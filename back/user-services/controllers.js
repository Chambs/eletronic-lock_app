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

function updateUser(req, res) {
  const oldEmail = req.params.email;
  const { name, email, password, currentUser } = req.body;

  const user = findByEmail(oldEmail);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  if (!currentUser || currentUser !== oldEmail) {
    return res.status(403).json({ error: 'Acesso negado. Você só pode editar a sua própria conta.' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }
  if (email && email !== oldEmail && findByEmail(email)) {
    return res.status(400).json({ error: 'Já existe um usuário com este email.' });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (password && password.length >= 6) user.password = password;
  if (req.file) user.profileImage = req.file.filename;

  /*
   * ao mudar o email, precisará alterar as informações na lockList (server:3003)
   * (já existe uma função updateEmail em lockList e já está importada em lockRoutes)
   * e vai precisar também checar se esse email novo já existe na base de dados
  */
  return res.json({
    message: 'Usuário atualizado com sucesso!',
    user: { name: user.name, email: user.email, profileImage: user.profileImage }
  });
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

function register(req, res){ //registrar usuário (como admin) em uma nova fechadura
  const {email, code} = req.body;
  addAdminCodeToUser(email, code);
  res.json({ message: 'User registred'});
}

function join(req, res){ //usuário fazer parte (como nonAdmin) de uma fechadura já existente
  const {email, code} = req.body;
  addNonAdminCodeToUser(email, code);
  res.json({ message: 'Join successful'});
}

module.exports = {
  getUsers,
  createUser,
  lockAction,
  login,
  updateUser,
  upload,
  register,
  join
};
