const express = require('express');
const controller = require('./controllers');
const router = express.Router();

router.get('/', controller.getUsers);
router.post('/', controller.createUser);
router.post('/lock-actions', controller.lockAction);
router.post('/login', controller.login); 
router.put('/:email', controller.upload.single('profileImage'), controller.updateUser);
router.post('/register', controller.register); //registrar usuário em nova fechadura
router.post('/join', controller.join); //usuário entrar em fechadura já existente

module.exports = router;
