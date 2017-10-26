const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');
const clientController = require('../controllers/client');
const rootController = require('../controllers/root');

// INDEX
router.get('/', auth.ensureAuthenticated, rootController.getAdminIndex);

// MANAGE CLIENT
router.get('/clients', auth.ensureAuthenticated, clientController.getClients);
router.get('/clients/:id/client', auth.ensureAuthenticated, clientController.getClient);
router.get('/clients/new', auth.ensureAuthenticated, clientController.getNewClient);
router.post('/clients/new', auth.ensureAuthenticated, clientController.postNewClient);

// MANAGE PROJECTS
router.get('/clients/:id/projects/new', auth.ensureAuthenticated, clientController.getNewProject);
router.post('/clients/:id/projects/new', auth.ensureAuthenticated, clientController.postNewProject);
/*
router.get('/clients/:id/edit', auth.ensureAuthenticated, clientController.getEditClient);
router.get('/clients/:id/edit', auth.ensureAuthenticated, clientController.postEditClient);

// MANAGE PROJECT
router.get('/clients/:id/projects', auth.ensureAuthenticated, clientController.getProjects);
router.get('/clients/:id/projects/:id', auth.ensureAuthenticated, clientController.getProject);
router.get('/clients/:id/projects/:id/edit', auth.ensureAuthenticated, clientController.getEditProject);
router.post('/clients/:id/projects/:id/edit', auth.ensureAuthenticated, clientController.postEditProject);
*/
// MANAGE USERS
router.get('/users/', auth.ensureAuthenticated,userController.getUsers);
router.get('/users/:username/user', auth.ensureAuthenticated, userController.getUser);
router.get('/users/create', auth.ensureAuthenticated, userController.getNewUser);
router.post('/users/create', auth.ensureAuthenticated, userController.postNewUser);
router.post('/users/:id/edit', auth.ensureAuthenticated, userController.postUser);
/*
router.post('/users/:id/edit', userController.postEditUser);
*/

module.exports = router;
