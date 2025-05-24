let users = [];

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
  const newUser = { name, email, password, profileImage };
  users.push(newUser);
  return newUser;
}

module.exports = {
  getAll,
  findByEmail,
  updateUser,
  emailExists,
  addUser
};
