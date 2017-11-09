const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user');

module.exports.ensureAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    serialize(req.user, function(err, serializeUser){
      if(err) return err;
      req. user = serializeUser;
    });
    return next();
  } else {
    res.render('users/login', {username:'', error_msg: 'Debes estar logueado'});
  }
};

const serialize = function(user, done){
  let SerializedUser = {
    _id: user._id,
    username: user.username,
    email: user.email, // USER EMAIL
    role: user.role,
    photo: user.photo,
    working_on: user.working_on
  };
  done(null, SerializedUser);
}

module.exports.serializeUser = function(user, done){
  let SerializedUser = {
    _id: user._id,
    username: user.username,
    email: user.email, // USER EMAIL
    role: user.role,
    photo: user.photo,
    working_on: user.working_on
  };
  done(null, SerializedUser);
}

const deserialize = function(user, done){
  User.getUserById(user._id, function(err, user) {
    done(err, user);
  });
}

module.exports.deserializeUser = function(user, done){
  User.getUserById(user._id, function(err, user) {
    done(err, user);
  });
}

module.exports.authenticate = function(username, password, done) {
  User.getUserByUsername(username, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { error_msg: 'Incorrect username.' });
    } User.comparePasswords(password, user.password, function(err, isMatch){
        if(err){
          console.log(err);
        } else {
          if(isMatch){
            serialize(user, function(err, serializedUser){
              if(err) return done(err, null);
              return done(null, serializedUser);
            });
          } else {
            return done(null,false, {error_msg: 'El password no coincide'});
          }
        }
      });
  });
};

passport.serializeUser(function(user, done) {
  let SerializedUser = {
    _id: user._id,
    username: user.username,
    email: user.email, // USER EMAIL
    role: user.role,
    photo: user.photo,
    working_on: user.working_on
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
              user = serialize(user);
              return done(null, user);
            } else {
              return done(null,false, {error_msg: 'El password no coincide'});
            }
          }
        });
    });
  }
));
