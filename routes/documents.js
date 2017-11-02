const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');
const clientController = require('../controllers/client');

// INDEX
router.get('/', auth.ensureAuthenticated, rootController.getAdminIndex);
