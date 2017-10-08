
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');
const clientController = require('../controllers/client');


router.get('/', auth.ensureAuthenticated, clientController.getClients);
router.get('/:id', auth.ensureAuthenticated, clientController.getClient);
router.get('/:id/projects/:id', auth.ensureAuthenticated, clientController.getProject);


module.exports = router;
