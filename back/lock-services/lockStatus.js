const eventBus = require('../shared-bus/eventBus');
let lockStatus = 'Fechada';

function getStatus() {
  return lockStatus;
}

function setStatus(status) {
  if (status === 'Aberta' || status === 'Fechada') {
    lockStatus = status;
    eventBus.emit('statusChanged', lockStatus);
  }
}

module.exports = { getStatus, setStatus };
