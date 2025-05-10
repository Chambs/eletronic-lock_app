let logList = [];

function addLog(log) {
  logList.push(log);
}

function getAll() {
  return logList;
}

module.exports = {
  addLog,
  getAll
};
