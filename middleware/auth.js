const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user');

module.exports.ensureAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.render('users/login', {username:'', error_msg: 'Debes estar logueado'});
  }
};
passport.serializeUser(function(user, done) {
  let SerializedUser = {
    _id: user._id,
    username: user.username,
    email: user.email, // USER EMAIL
    name: user.name,
    lastname: user.lastname
  };
  done(null, SerializedUser);
});

passport.deserializeUser(function(user, done) {
  User.getUserById(user._id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { error_msg: 'Incorrect username.' });
      } User.comparePasswords(password, user.password, function(err, isMatch){
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
