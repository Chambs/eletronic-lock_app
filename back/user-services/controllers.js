const userRepository = require('./userRepository');
const bcrypt = require('bcrypt');
const axios = require('axios');
const multer = require('multer');
const path = require('path');


const USER_SERVICE = 'http://user-service.electronic-lock-app.svc.cluster.local:3001/api/users';
const LOG_SERVICE = 'http://log-service.electronic-lock-app.svc.cluster.local:3002/api/logs';
const LOCK_SERVICE = 'http://lock-service.electronic-lock-app.svc.cluster.local:3003/api/locks';
const EVENT_SERVICE = 'http://event-bus.electronic-lock-app.svc.cluster.local:10000/api/events';

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

function formatUserResponse(user) {
  if (!user) return user;

  const { profile_image, is_admin, ...rest } = user;
  const normalized = { ...rest };

  if (typeof is_admin !== 'undefined') {
    normalized.isAdmin = Boolean(is_admin);
  } else if (typeof user.isAdmin !== 'undefined') {
    normalized.isAdmin = Boolean(user.isAdmin);
  }

  normalized.profileImage = profile_image ?? user.profileImage ?? null;
  return normalized;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getUsers(req, res) {
  try {
    const { code } = req.query;
    const users = await userRepository.findUsersByCode(code);
    const normalizedUsers = users.map(formatUserResponse);
    res.json(normalizedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const emailExists = await userRepository.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // hashing senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await userRepository.createUser({
      name,
      email,
      password_hash,
      profile_image: null
    });

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function lockAction(req, res) {
  try {
    const { user, action, code } = req.body;
    if (!user || !action) {
      return res.status(400).json({ error: 'User and action are required.' });
    }

    await axios.post(`${LOG_SERVICE}`, {
      user,
      action,
      code,
      timestamp: new Date()
    });
    res.status(200).json({ message: 'Ação registrada com sucesso.' });
  } catch (error) {
    console.error('Error logging action:', error);
    res.status(500).json({ error: 'Erro ao registrar ação no LogService.' });
  }
}

async function updateUser(req, res) {
  try {
    const email = req.params.email;
    const { name, email: newEmail, password } = req.body;
    let profileImage = req.file ? req.file.filename : undefined;

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const updates = {};
    if (name) updates.name = name;
    if (profileImage) updates.profile_image = profileImage;
    if (password) {
      const saltRounds = 10;
      updates.password_hash = await bcrypt.hash(password, saltRounds);
    }

    if (newEmail && newEmail !== email) {
      const emailExists = await userRepository.emailExists(newEmail);
      if (emailExists) {
        return res.status(409).json({ error: 'Já existe um usuário com esse e-mail.' });
      }

      await userRepository.updateEmail(email, newEmail);

      try {
        await axios.post(`${LOCK_SERVICE}/update-email`, {
          email: email,
          newEmail: newEmail
        });
      } catch (error) {
        console.error('Error updating email in lock service:', error);
      }

      return res.json({
        message: 'Usuário atualizado com sucesso!',
        user: formatUserResponse({ ...user, email: newEmail })
      });
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = await userRepository.updateUser(email, updates);
      res.json({ message: 'Usuário atualizado com sucesso!', user: formatUserResponse(updatedUser) });
    } else {
      res.json({ message: 'Usuário atualizado com sucesso!', user: formatUserResponse(user) });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { email } = req.params;
    const requester = req.body.requester;

    const userToDelete = await userRepository.findByEmail(email);
    const requestingUser = await userRepository.findByEmail(requester);

    if (!userToDelete) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (!requestingUser) return res.status(403).json({ error: 'Operação não permitida.' });

    // Check se user eh admin
    const userAccess = await userRepository.findUsersByCode(''); 
    const isAdmin = userAccess.some(access => access.user_email === requester && access.is_admin);

    const isSelf = requester === email;
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este usuário.' });
    }

    await userRepository.deleteUser(email);

    try {
      await axios.post(`${LOCK_SERVICE}/remove-user-access`, { email });
    } catch (e) {
      console.error('Erro ao remover acessos:', e.message);
    }

    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({ 
      message: 'Login successful', 
      name: user.name, 
      email: user.email, 
      profileImage: user.profile_image 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function register(req, res) {
  try {
    const { email, code } = req.body;
    const success = await userRepository.addAdminCodeToUser(email, code);
    if (success) {
      res.json({ message: 'User registered' });
    } else {
      res.status(400).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function join(req, res) {
  try {
    const { email, code } = req.body;
    console.log("123: " + email + " " + code);
    const success = await userRepository.addNonAdminCodeToUser(email, code);
    if (success) {
      res.json({ message: 'Join successful' });
    } else {
      res.status(400).json({ error: 'Failed to join lock' });
    }
  } catch (error) {
    console.error('Error joining lock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function removeCode(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios.' });
    }
    const success = await userRepository.removeCodeFromUser(email, code);
    if (success) {
      res.json({ message: 'Código removido.' });
    } else {
      res.status(404).json({ error: 'Código não encontrado.' });
    }
  } catch (error) {
    console.error('Error removing code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateRole(req, res) {
  try {
    const { email, code, newRole, requesterEmail } = req.body;
    
    if (!email || !code || !newRole || !requesterEmail) {
      return res.status(400).json({ error: 'Email, código, nova role e email do requisitante são obrigatórios.' });
    }

    if (!['admin', 'user', 'guest'].includes(newRole)) {
      return res.status(400).json({ error: 'Role inválida. Deve ser admin, user ou guest.' });
    }

    // Verificar se o requisitante é admin da lock
    const users = await userRepository.findUsersByCode(code);
    const requester = users.find(u => u.email === requesterEmail);
    
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem alterar roles.' });
    }

    // Verificar se está tentando alterar o próprio admin
    if (email === requesterEmail && newRole !== 'admin') {
      return res.status(400).json({ error: 'Você não pode remover sua própria role de admin.' });
    }

    const success = await userRepository.updateUserRole(email, code, newRole);
    if (success) {
      res.json({ message: 'Role atualizada com sucesso.' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado nesta fechadura.' });
    }
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  join,
  removeCode,
  updateRole
};
