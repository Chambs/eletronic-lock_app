const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const eventBus = require('../shared-bus/eventBus');
const locksManager = require('./locks'); // Usando o arquivo acima

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());
app.use('/', routes);

eventBus.on('userEmailChanged', ({ oldEmail, newEmail }) => {
  let lockList = locks.getLocks();
  let updated = false;
  lockList.forEach(lock => {
    if (lock.permittedUsers && lock.permittedUsers.includes(oldEmail)) {
      lock.permittedUsers = lock.permittedUsers.map(email =>
        email === oldEmail ? newEmail : email
      );
      updated = true;
    }
  });
  if (updated) {
    locks.setLocks(lockList);
    console.log(`Atualizado email ${oldEmail} para ${newEmail} nas fechaduras.`);
  }
});

app.listen(PORT, () => {
  console.log(`LockService is running on http://localhost:${PORT}`);
});
