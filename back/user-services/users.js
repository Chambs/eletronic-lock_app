const userList = [];

function getAll() {
  return userList;
}

function add(user) {
  const newUser = {
    id: userList.length + 1,
    name: user.name,
    email: user.email,
    createdAt: new Date().toISOString(),
  };
  userList.push(newUser);
  return newUser;
}

module.exports = {
  getAll,
  add,
};
