const eventBus = require('../shared-bus/eventBus');

let Registredlocks = [
  {
    lockNumber: 1,                        // Lock number
    registrationCode: 'LC12345',             // Registration code
    inviteCode: 'invite1',
    adminEmail: 'admin@lock1.com',           // Admin user's email
    lockName: 'Lock1',
    status: 'Fechada',
    nonAdminUsers: [
      { email: 'jose@example.com' },
      { email: 'ana@example.com' }
    ]                                       // List of non-admin users
  },
  {
    lockNumber: 2,
    registrationCode: 'LC12346',
    inviteCode: 'invite2',
    adminEmail: 'jose@example.com',
    lockName: 'Lock2',
    status: 'Aberta',
    nonAdminUsers: [
      { email: 'carlos@example.com' },
      { email: 'lucia@example.com' }
    ]
  },
  {
    lockNumber: 3,
    registrationCode: 'LC12347',
    inviteCode: 'invite3',
    adminEmail: 'admin@lock3.com',
    lockName: 'Lock3',
    status: 'Fechada',
    nonAdminUsers: [
      { email: 'jose@example.com' }
    ]
  },
  {
    lockNumber: 4,
    registrationCode: 'LC12348',
    inviteCode: 'invite4',
    adminEmail: 'admin@lock4.com',
    lockName: 'Lock4',
    status: 'Aberta',
    nonAdminUsers: [
      { email: 'pedro@example.com' }
    ]
  },
  {
    lockNumber: 5,
    registrationCode: 'LC12349',
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
  Registredlocks.forEach(lock => {
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
  const lock = Registredlocks.find(lock => lock.registrationCode === registrationCode);
  return lock ? lock.status : 'Fechadura não encontrada';
}

// Função setStatus para atualizar o status da fechadura com o registrationCode
function setStatus(registrationCode, status) {
  const lock = Registredlocks.find(lock => lock.registrationCode === registrationCode);
  if (lock) {
    lock.status = status;
    return `Status da fechadura ${registrationCode} atualizado para: ${status}`;
  } else {
    return 'Fechadura não encontrada';
  }
}

function isLockCodeExists(registrationCode) {
  return Registredlocks.some(lock => lock.registrationCode === registrationCode);
}

function hasNoAdminForLock(registrationCode) {
  // Encontra a fechadura com o código de registro fornecido e verifica se o adminEmail está vazio
  const lock = Registredlocks.find(lock => lock.registrationCode === registrationCode);
  return lock && !lock.adminEmail; // Retorna true se não houver admin, caso contrário, false
}

function assignAdminToLock(registrationCode, email, lockName) {
  // Encontra a fechadura com o registrationCode fornecido
  const lock = Registredlocks.find(lock => lock.registrationCode === registrationCode);
  
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
  return Registredlocks.some(lock => lock.inviteCode === inviteCode);
}

function isEmailRegistered(inviteCode, email) {
  const lock = Registredlocks.find(lock => lock.inviteCode === inviteCode);
  
  // Verifica se o email está cadastrado como admin ou não admin
  if (lock.adminEmail === email) {
    return true; // Email encontrado como admin
  }

  const isNonAdmin = lock.nonAdminUsers.some(user => user.email === email);
  return isNonAdmin; // Verifica se o email está na lista de não-admins
}

function addNonAdminUser(inviteCode, email) {
  const lock = Registredlocks.find(lock => lock.inviteCode === inviteCode);
  
  // Adiciona o email à lista de nonAdminUsers
  lock.nonAdminUsers.push({ email });
  return true; // Sucesso
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
    addNonAdminUser 
};
