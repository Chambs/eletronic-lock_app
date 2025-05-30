const fs = require('fs');
const path = require('path');

const LOCKS_FILE = path.join(__dirname, 'locks.json');

function loadLocks() {
  if (fs.existsSync(LOCKS_FILE)) {
    return JSON.parse(fs.readFileSync(LOCKS_FILE, 'utf-8'));
  }
  return [];
}

function saveLocks(locks) {
  fs.writeFileSync(LOCKS_FILE, JSON.stringify(locks, null, 2));
}

let locks = loadLocks();

module.exports = {
  getLocks: () => locks,
  setLocks: (newLocks) => {
    locks = newLocks;
    saveLocks(locks);
  },
  saveLocks: () => saveLocks(locks)
};
