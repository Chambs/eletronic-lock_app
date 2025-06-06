let logList = [];

function addLog(log) {
  logList.push(log);
}

function getAll() {
  return logList;
}

function addOrCreateLog(code, logMessage) {
  let entry = logList.find(r => r.code === code);

  if (!entry) {
    logList.push({
      code: code,
      logs: [logMessage]
    });
  } else {
    entry.logs.push(logMessage);
  }

}

function getLogsByCode(code) {
  const register = logList.find(r => r.code === code);
  return register ? register.logs : [];
}

function resetLogsByCode(code) {
  const idx = logList.findIndex(r => r.code === code);
  if (idx !== -1) {
    logList.splice(idx, 1);
  }
}

module.exports = {
  addLog,
  getAll,
  addOrCreateLog,
  getLogsByCode,
  resetLogsByCode
};
