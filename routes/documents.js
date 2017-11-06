const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');
const clientController = require('../controllers/client');
const documentController = require('../controllers/document');


// INDEX
router.get('/:id', auth.ensureAuthenticated, documentController.getDocument);
router.post('/new', auth.ensureAuthenticated, documentController.postDocument);

module.exports = router;
