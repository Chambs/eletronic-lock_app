const axios = require('axios');

let registredLocks = [
  {
    lockNumber: 1,
    registrationCode: 'LOCK1',
    inviteCode: 'invite1',
    adminEmail: '',
    lockName: '',
    status: 'Fechada',
    nonAdminUsers: []
  },
  {
    lockNumber: 2,
    registrationCode: 'LOCK2',
    inviteCode: 'invite2',
    adminEmail: '',
    lockName: '',
    status: 'Fechada',
    nonAdminUsers: []
  },
  {
    lockNumber: 3,
    registrationCode: 'LOCK3',
    inviteCode: 'invite3',
    adminEmail: '',
    lockName: '',
    status: 'Fechada',
    nonAdminUsers: []
  },
  {
    lockNumber: 4,
    registrationCode: 'LOCK4',
    inviteCode: 'invite4',
    adminEmail: '',
    lockName: '',
    status: 'Fechada',
    nonAdminUsers: []
  },
  {
    lockNumber: 5,
    registrationCode: 'LOCK5',
    inviteCode: 'invite5',
    adminEmail: '',
    lockName: '',
    status: 'Fechada',
    nonAdminUsers: []
  }
];

function findLocksByEmail(email) {
  const result = [];

  registredLocks.forEach(lock => {
    if (lock.adminEmail === email) {
      result.push({
        lockName: lock.lockName,
        registrationCode: lock.registrationCode,
        isAdmin: true
      });
    }

    lock.nonAdminUsers.forEach(user => {
      if (user.email === email) {
        result.push({
          lockName: lock.lockName,
          registrationCode: lock.registrationCode,
          isAdmin: false
        });
      }
    });
  });

  return result;
}

function getStatus(registrationCode) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock ? lock.status : 'Fechadura não encontrada';
}

function setStatus(registrationCode, status) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  if (lock) {
    lock.status = status;
    return `Status da fechadura ${registrationCode} atualizado para: ${status}`;
  } else {
    return 'Fechadura não encontrada';
  }
}

function isLockCodeExists(registrationCode) {
  return registredLocks.some(lock => lock.registrationCode === registrationCode);
}

function hasNoAdminForLock(registrationCode) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock && !lock.adminEmail;
}

function assignAdminToLock(registrationCode, email, lockName) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);

  if (lock) {
    lock.adminEmail = email;
    lock.lockName = lockName;

    return true;
  } else {
    return false;
  }
}

function removeUserAccess(req, res) {
  const { email, code } = req.body;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });

  const removeFromLock = (lock) => {
    if (lock.adminEmail === email) {
      lock.adminEmail = '';
    }
    lock.nonAdminUsers = lock.nonAdminUsers.filter(user => user.email !== email);
  };

  if (code) {
    const lock = registredLocks.find(l => l.registrationCode === code);
    if (lock) removeFromLock(lock);
  } else {
    registredLocks.forEach(removeFromLock);
  }

  if (code) {
    axios.post('http://localhost:3001/users/remove-code', { email, code })
      .catch(() => { });
  }

  return res.json({ message: 'Acessos removidos.' });
}

function removeInvitedUser(registrationCode, emailToRemove) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  if (!lock) return false;
  const prevCount = lock.nonAdminUsers.length;
  lock.nonAdminUsers = lock.nonAdminUsers.filter(user => user.email !== emailToRemove);
  return lock.nonAdminUsers.length < prevCount;
}

function removeOwnAccess(registrationCode, userEmail) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  if (!lock) return false;
  const prevCount = lock.nonAdminUsers.length;
  lock.nonAdminUsers = lock.nonAdminUsers.filter(user => user.email !== userEmail);
  return lock.nonAdminUsers.length < prevCount;
}



function isInviteCodeExists(inviteCode) {
  return registredLocks.some(lock => lock.inviteCode === inviteCode);
}

function isEmailRegistered(inviteCode, email) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);

  if (lock.adminEmail === email) {
    return true;
  }

  const isNonAdmin = lock.nonAdminUsers.some(user => user.email === email);
  return isNonAdmin;
}

function addNonAdminUser(inviteCode, email) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);

  lock.nonAdminUsers.push({ email });
  return true;
}

function findLockByRegistrationCode(registrationCode) {
  return registredLocks.find(lock => lock.registrationCode === registrationCode);
}

function getRegistrationCodeByInviteCode(inviteCode) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  return lock ? lock.registrationCode : null;
}

function getInviteCodeByRegistrationCode(registrationCode) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock ? lock.inviteCode : null;
}

function hasAdmin(inviteCode) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  return lock ? lock.adminEmail.trim() !== '' : false;
}

function updateEmail(oldEmail, newEmail) {
  registredLocks.forEach(lock => {
    if (lock.adminEmail === oldEmail) {
      lock.adminEmail = newEmail;
    }

    lock.nonAdminUsers.forEach(user => {
      if (user.email === oldEmail) {
        user.email = newEmail;
      }
    });
  });
}


module.exports = {
  findLocksByEmail,
  getStatus,
  setStatus,
  isLockCodeExists,
  hasNoAdminForLock,
  assignAdminToLock,
  isInviteCodeExists,
  isEmailRegistered,
  addNonAdminUser,
  getRegistrationCodeByInviteCode,
  getInviteCodeByRegistrationCode,
  hasAdmin,
  updateEmail,
  removeUserAccess,
  removeInvitedUser,
  removeOwnAccess,
  findLockByRegistrationCode
};
