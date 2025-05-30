const express = require('express');
const { findLocksByEmail, getStatus, setStatus, isLockCodeExists, hasNoAdminForLock, assignAdminToLock, isInviteCodeExists, isEmailRegistered, addNonAdminUser, getRegistrationCodeByInviteCode, getInviteCodeByRegistrationCode, hasAdmin, updateEmail } = require('./controllers');
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
  else if( !hasAdmin(code) ){
    return res.status(423).json({ error: 'Esta fechadura ainda não está disponível.' });
  }
  else{
    addNonAdminUser(code, email);
    return res.status(200).json({ message: 'Agora você é um usuário dessa fechadura.', registrationCode: getRegistrationCodeByInviteCode(code)});
  }
  
});

router.get('/invite-code', (req, res) => {
  const {code} = req.query;
  return res.json({inviteCode: getInviteCodeByRegistrationCode(code)});
});

router.post('/update-email', (req, res) => {
  const {email, newEmail} = req.body;
  updateEmail(email, newEmail);
  res.status(200).json({ message: 'Email atualizado.'});
});

module.exports = router;
