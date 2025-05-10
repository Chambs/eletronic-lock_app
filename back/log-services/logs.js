let logs = [];

function addLog(log) {
  logs.push(log);
}

function getLogs() {
  return logs;
}

module.exports = {
  addLog,
  getLogs
};
