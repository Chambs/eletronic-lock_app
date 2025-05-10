let userList = [];

function addUser(user) {
  userList.push(user);
}

function getAll() {
  return userList;
}

function findByEmail(email) {
  return userList.find(user => user.email === email);
}

module.exports = {
  addUser,
  getAll,
  findByEmail
};
