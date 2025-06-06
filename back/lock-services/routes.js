const express = require('express');
const { findLocksByEmail, getStatus, setStatus, isLockCodeExists, hasNoAdminForLock, assignAdminToLock, isInviteCodeExists, isEmailRegistered, addNonAdminUser, getRegistrationCodeByInviteCode, getInviteCodeByRegistrationCode, hasAdmin, updateEmail } = require('./controllers');
const router = express.Router();
const controller = require('./controllers');

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
  const { email } = req.body;
  res.json({ list: findLocksByEmail(email) });
});

router.post('/remove-user-access', controller.removeUserAccess);

router.delete('/locks/:registrationCode/invitee/:email', (req, res) => {
  const { registrationCode, email } = req.params;
  const requester = (req.body && req.body.requester) || req.query.requester;

  const lock = controller.findLockByRegistrationCode
    ? controller.findLockByRegistrationCode(registrationCode)
    : null;
  if (!lock || lock.adminEmail !== requester) {
    return res.status(403).json({ error: 'Apenas admin pode remover convidados.' });
  }

  const removed = controller.removeInvitedUser(registrationCode, email);
  if (removed) {
    res.json({ message: 'Usuário removido com sucesso.' });
  } else {
    res.status(404).json({ error: 'Usuário não encontrado para remover.' });
  }
});

router.delete('/locks/:registrationCode/self-access', (req, res) => {
  const { registrationCode } = req.params;
  const userEmail = (req.body && req.body.userEmail) || req.query.userEmail;

  const removed = controller.removeOwnAccess(registrationCode, userEmail);
  if (removed) {
    res.json({ message: 'Acesso removido com sucesso.' });
  } else {
    res.status(404).json({ error: 'Acesso não encontrado.' });
  }
});

router.post('/register', (req, res) => {
  const { code, nickname, admin } = req.body;

  if (!isLockCodeExists(code)) {
    return res.status(404).json({ error: 'Código de registro inválido.' });
  }
  else if (!hasNoAdminForLock(code)) {
    return res.status(409).json({ error: 'Fechadura já registrada em um email.' });
  }
  else {
    assignAdminToLock(code, admin, nickname);
    return res.status(200).json({ message: 'Fechadura registrada com sucesso.' });
  }

});

router.post('/join', (req, res) => {
  const { invitationCode, email } = req.body;

  if (!isInviteCodeExists(invitationCode)) {
    return res.status(404).json({ error: 'Código de convite inválido.' });
  }
  else if (isEmailRegistered(invitationCode, email)) {
    return res.status(409).json({ error: 'Você já está registrado nessa fechadura.' });
  }
  else if (!hasAdmin(invitationCode)) {
    return res.status(423).json({ error: 'Esta fechadura ainda não está disponível.' });
  }
  else {
    addNonAdminUser(invitationCode, email);
    return res.status(200).json({ message: 'Agora você é um usuário dessa fechadura.', registrationCode: getRegistrationCodeByInviteCode(invitationCode) });
  }

});

router.get('/invite-code', (req, res) => {
  const { code } = req.query;
  return res.json({ inviteCode: getInviteCodeByRegistrationCode(code) });
});

router.post('/update-email', (req, res) => {
  const { email, newEmail } = req.body;
  updateEmail(email, newEmail);
  res.status(200).json({ message: 'Email atualizado.' });
});

module.exports = router;
