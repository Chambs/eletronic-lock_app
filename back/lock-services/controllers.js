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
    updateEmail
};
