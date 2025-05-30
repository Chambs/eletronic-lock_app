let logList = [
  // {
  //     code: 'LOCK1',
  //     logs: [
  //       { user, action, timestamp },
  //       { user, action, timestamp }'
  //     ]
  //   },
  //   {
  //     code: 'LOCK2',
  //     logs: [
  //       { user, action, timestamp }
  //     ]
  // }
];

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

module.exports = {
  addLog,
  getAll,
  addOrCreateLog,
  getLogsByCode
};
