const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rootController = require('../controllers/root');

router.get('/', auth.ensureAuthenticated, rootController.getIndex);

module.exports = router;
