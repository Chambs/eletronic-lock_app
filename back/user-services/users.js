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

function addUser(user) {
  users.push(user);
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

function findUsersByCode(code) {
  return users.filter(u => u.codes && u.codes.includes(code));
}

function addAdminCodeToUser(email, code) {
  const user = users.find(u => u.email === email);
  if (user) {
    if (!user.codes) user.codes = [];
    if (!user.codes.includes(code)) user.codes.push(code);
    user.isAdmin = true;
  }
}

function addNonAdminCodeToUser(email, code) {
  const user = users.find(u => u.email === email);
  if (user) {
    if (!user.codes) user.codes = [];
    if (!user.codes.includes(code)) user.codes.push(code);
    user.isAdmin = false;
  }
}

module.exports = {
  getAll,
  findByEmail,
  emailExists,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  findUsersByCode,
  addAdminCodeToUser,
  addNonAdminCodeToUser
};
