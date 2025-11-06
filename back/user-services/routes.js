const express = require('express');
const controller = require('./controllers');
const router = express.Router();

router.get('/', controller.getUsers);
router.post('/', controller.createUser);
router.post('/lock-actions', controller.lockAction);
router.post('/login', controller.login); 
router.put('/:email', controller.upload.single('profileImage'), controller.updateUser);
router.delete('/:email', controller.deleteUser);
router.post('/register', controller.register);
router.post('/join', controller.join);
router.post('/remove-code', controller.removeCode);
router.post('/update-role', controller.updateRole);

module.exports = router;
