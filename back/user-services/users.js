let users = [
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
  return users.some(u => u.email === email);
}

function updateUser(oldEmail, { name, email: newEmail, password, profileImage }) {
  const user = users.find(u => u.email === oldEmail);
  if (!user) return null;

  if (name && name.trim()) user.name = name.trim();

  if (
    newEmail &&
    newEmail.trim() &&
    newEmail !== oldEmail &&
    !emailExists(newEmail)
  ) {
    user.email = newEmail.trim();
  }

  if (password && password.length >= 6) {
    user.password = password;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  return user;
}

function addUser({ name, email, password, profileImage = null }) {
  if (emailExists(email)) return null;
  const newUser = { name:name, email:email, password:password, profileImage:profileImage, admin:[], nonAdmin:[] };
  users.push(newUser);
  return newUser;
}

function findUsersByCode(code) {
  return users
    .filter(user => user.admin.includes(code) || user.nonAdmin.includes(code))
    .map(user => ({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.admin.includes(code) ? "Admin" : "nonAdmin"
    }));
}

function addAdminCodeToUser(email, registrationCode) {
  const user = users.find(u => u.email === email);
  if (!user) {
    return false;
  }

  // Garante que não adicione duplicados ou string vazia inicial
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

  // Garante que não adicione duplicados ou substitui se vier [""] vazio
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
  updateUser,
  emailExists,
  addUser,
  findUsersByCode,
  addAdminCodeToUser,
  addNonAdminCodeToUser
};
