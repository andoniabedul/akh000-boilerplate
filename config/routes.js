// DEPENDENCIES
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// CONTROLLERS
var indexController = require('../routes/index');
var usersController = require('../routes/users');

// MODEL USER
const User = require('../model/user');

// CHECK IF IS AUTHENTICATED
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    console.log("auth");
    return next();
  } else {
    res.render('users/login', {username:'', error_msg: 'Debes estar logueado'});
  }
}
// PASSPORT LOCAL STRATEGY
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { error_msg: 'Incorrect username.' });
      } User.comparePasswords(password, user.password,function(err, isMatch){
          if(err){
            console.log(err);
          } else {
            if(isMatch){
              return done(null, user);
            } else {
              return done(null,false, {error_msg: 'El password no coincide'});
            }
          }
        });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(app){
  var apiRoutes = express.Router();
  var usersRoutes = express.Router();
  var indexRoutes = express.Router();


  var requireLogin = passport.authenticate('local', {session: false});

  // DASHBOARD
  apiRoutes.use('/index', indexRoutes);
  indexRoutes.get('/', ensureAuthenticated, indexController.getIndex);

  apiRoutes.use('/users', usersRoutes);
  // USERS
  usersRoutes.get('/register', function(req,res){console.log("aquí estoy");});
  usersRoutes.post('/register', usersController.postRegister);
  usersRoutes.get('/login', usersController.getLogin);
  usersRoutes.post('/login', usersController.postLogin);
  usersRoutes.get('/profile', ensureAuthenticated, usersController.getProfile);
  usersRoutes.post('/profile', ensureAuthenticated,usersController.postProfile);
  usersRoutes.get('/logout', usersController.getLogout);

  app.use('/', apiRoutes);
}
