const users = [
  // {
  //     name: "jose",
  //     email: "jose@example.com",
  //     password: "123456",
  //     profileImage: null,
  //     admin: ["LOCK1"],
  //     nonAdmin: ["LOCK2", "LOCK3"]
  // },{
  //     name: "ana",
  //     email: "ana@example.com",
  //     password: "123456",
  //     profileImage: null,
  //     admin: [""],
  //     nonAdmin: ["LOCK1"]
  // }
];
function getAll() {
  return users;
}

function findByEmail(email) {
  return users.find(u => u.email === email);
}

function emailExists(email) {
  return !!users.find(u => u.email === email);
}

function getUser(email) {
  return users.find(u => u.email === email);
}

function addUser({ name, email, password, profileImage = null }) {
  if (emailExists(email)) return null;
  const newUser = { name:name, email:email, password:password, profileImage:profileImage, admin:[], nonAdmin:[] };
  users.push(newUser);
  return newUser;
}

function updateUser(email, newUser) {
  const idx = users.findIndex(u => u.email === email);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...newUser };
  }
}

function deleteUser(email) {
  const idx = users.findIndex(u => u.email === email);
  if (idx !== -1) users.splice(idx, 1);
}

function updateEmail(email, newEmail) {
  for (let user of users) {
    if (user.email === email) {
      user.email = newEmail;
    }
  }
}

function findUsersByCode(code) {
  return users
    .filter(user => user.admin.includes(code) || user.nonAdmin.includes(code))
    .map(user => ({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isAdmin: user.admin.includes(code) ? true : false
    }));
}

function addAdminCodeToUser(email, registrationCode) {
  const user = users.find(u => u.email === email);
  if (!user) {
    return false;
  }

  if (user.admin.length === 1 && user.admin[0] === "") {
    user.admin[0] = registrationCode;
  } else if (!user.admin.includes(registrationCode)) {
    user.admin.push(registrationCode);
  }

  return true;
}

function addNonAdminCodeToUser(email, registrationCode) {
  const user = users.find(u => u.email === email);
  if (!user) {
    return false;
  }

  if (user.nonAdmin.length === 1 && user.nonAdmin[0] === "") {
    user.nonAdmin[0] = registrationCode;
  } else if (!user.nonAdmin.includes(registrationCode)) {
    user.nonAdmin.push(registrationCode);
  }

  return true;
}

module.exports = {
  getAll,
  findByEmail,
  emailExists,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  updateEmail,
  findUsersByCode,
  addAdminCodeToUser,
  addNonAdminCodeToUser
};
