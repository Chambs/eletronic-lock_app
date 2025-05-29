const express = require('express');
const { findLocksByEmail, getStatus, setStatus, isLockCodeExists, hasNoAdminForLock, assignAdminToLock, isInviteCodeExists, isEmailRegistered, addNonAdminUser } = require('./lockList');
const eventBus = require('../shared-bus/eventBus');
const router = express.Router();

router.get('/status', (req, res) => {
  const { code } = req.query;
  res.json({ status: getStatus(code) });
});

router.post('/status', (req, res) => {
  const { status, code } = req.body;
  if (status !== 'Aberta' && status !== 'Fechada') {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  setStatus(code, status);
  res.json({ status: getStatus() });
});

// router.get('/status-events', (req, res) => {
//   res.set({
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     'Connection': 'keep-alive'
//   });
//   res.flushHeaders();

//   const sendStatus = (status) => {
//     res.write(`data: ${JSON.stringify({ status })}\n\n`);
//   };

//   sendStatus(getStatus());

//   const listener = (status) => sendStatus(status);
//   eventBus.on('statusChanged', listener);

//   req.on('close', () => eventBus.off('statusChanged', listener));
// });

router.post('/locks', (req, res) => {
  const {email} = req.body;
  res.json({ list: findLocksByEmail(email) });
});

router.post('/register', (req, res) => {
  const {code, nickname, admin} = req.body;

  if ( !isLockCodeExists(code) ) {
    return res.status(404).json({ error: 'Código de registro inválido.' });
  }
  else if( !hasNoAdminForLock(code) ) {
    return res.status(409).json({ error: 'Fechadura já registrada em um email.' });
  }
  else{
    assignAdminToLock(code, admin, nickname);
    return res.status(200).json({ message: 'Fechadura registrada com sucesso.'});
  }
  
});

router.post('/join', (req, res) => {
  const {code, email} = req.body;

  if ( !isInviteCodeExists(code) ) {
    return res.status(404).json({ error: 'Código de convite inválido.' });
  }
  else if( isEmailRegistered(code, email) ) {
    return res.status(409).json({ error: 'Você já está registrado nessa fechadura.' });
  }
  else{
    addNonAdminUser(code, email);
    return res.status(200).json({ message: 'Agora você faz é um usuário dessa fechadura.'});
  }
  
});

module.exports = router;
