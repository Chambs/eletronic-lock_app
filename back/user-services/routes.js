const express = require('express');
const controller = require('./controllers');
const router = express.Router();

router.get('/', controller.getUsers);
router.post('/', controller.createUser);
router.post('/lock-actions', controller.lockAction);
router.post('/login', controller.login); 
router.put('/:email', controller.upload.single('profileImage'), controller.updateUser);

module.exports = router;
