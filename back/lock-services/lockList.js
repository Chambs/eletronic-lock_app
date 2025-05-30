const eventBus = require('../shared-bus/eventBus');

let registredLocks = [
  {
    lockNumber: 1,                                            // Lock number
    registrationCode: 'LOCK1',                                // Registration code
    inviteCode: 'invite1',                                    // Invitation code
    adminEmail: '', //email: 'admin@example.com'              // Admin user's email
    lockName: '',                                             // Lock name
    status: 'Fechada',                                        // Status
    nonAdminUsers: [                                          // List of non-Admin users
      //{ email: 'guest1@example.com' },
      //{ email: 'guest2@example.com' }
    ]
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

  // Percorre todas as fechaduras na lista
  registredLocks.forEach(lock => {
    // Verifica se o email é o admin dessa fechadura
    if (lock.adminEmail === email) {
      result.push({
        lockName: lock.lockName,
        registrationCode: lock.registrationCode,
        role: 'Admin'
      });
    }
    
    // Verifica se o email está na lista de nonAdminUsers
    lock.nonAdminUsers.forEach(user => {
      if (user.email === email) {
        result.push({
          lockName: lock.lockName,
          registrationCode: lock.registrationCode,
          role: 'nonAdmin'
        });
      }
    });
  });

  // Retorna a lista de fechaduras encontradas com o email
  return result;
}

// Função getStatus para obter o status da fechadura com o registrationCode
function getStatus(registrationCode) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock ? lock.status : 'Fechadura não encontrada';
}

// Função setStatus para atualizar o status da fechadura com o registrationCode
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
  // Encontra a fechadura com o código de registro fornecido e verifica se o adminEmail está vazio
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock && !lock.adminEmail; // Retorna true se não houver admin, caso contrário, false
}

function assignAdminToLock(registrationCode, email, lockName) {
  // Encontra a fechadura com o registrationCode fornecido
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  
  if (lock) {
    // Atribui o email ao adminEmail e o lockName à fechadura
    lock.adminEmail = email;
    lock.lockName = lockName;

    return true; // Retorna true se a atualização for bem-sucedida
  } else {
    // Retorna false se a fechadura com o registrationCode não for encontrada
    return false;
  }
}

function isInviteCodeExists(inviteCode) {
  return registredLocks.some(lock => lock.inviteCode === inviteCode);
}

function isEmailRegistered(inviteCode, email) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  
  // Verifica se o email está cadastrado como admin ou não admin
  if (lock.adminEmail === email) {
    return true; // Email encontrado como admin
  }

  const isNonAdmin = lock.nonAdminUsers.some(user => user.email === email);
  return isNonAdmin; // Verifica se o email está na lista de não-admins
}

function addNonAdminUser(inviteCode, email) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  
  // Adiciona o email à lista de nonAdminUsers
  lock.nonAdminUsers.push({ email });
  return true; // Sucesso
}

function getRegistrationCodeByInviteCode(inviteCode) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  return lock ? lock.registrationCode : null;
}

function getInviteCodeByRegistrationCode(registrationCode) {
  const lock = registredLocks.find(lock => lock.registrationCode === registrationCode);
  return lock ? lock.inviteCode : null; // Retorna null se não encontrar
}

function hasAdmin(inviteCode) {
  const lock = registredLocks.find(lock => lock.inviteCode === inviteCode);
  return lock ? lock.adminEmail.trim() !== '' : false;
}

function updateEmail(oldEmail, newEmail) {
  registredLocks.forEach(lock => {
    // Atualiza se for admin
    if (lock.adminEmail === oldEmail) {
      lock.adminEmail = newEmail;
    }

    // Atualiza se for non-admin
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
    updateEmail
};
