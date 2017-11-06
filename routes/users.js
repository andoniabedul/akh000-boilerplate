const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

// LOGIN USERS BY USERNAME
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
// PROFILE OF A USER
router.get('/profile', auth.ensureAuthenticated, userController.getProfile);
router.post('/profile', auth.ensureAuthenticated, userController.postProfile);
router.post('/profile/photo', auth.ensureAuthenticated, userController.postProfilePhoto);
// LOGOUT
router.get('/logout', userController.getLogout);

module.exports = router;
