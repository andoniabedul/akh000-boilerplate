const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');
const nconf = require('nconf');
nconf.file('./config/data.json');


// REGISTER USERS BY USERNAME
exports.getRegister = function(req, res) {
    res.render('users/register');
};

exports.postRegister = function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var name = req.body.name;
    var lastname = req.body.lastname;
    var password1 = req.body.password1;
    var password2 = req.body.password2;

    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('email','Email not valid').isEmail();
    req.checkBody('email','Email cant be empty').notEmpty();
    req.checkBody('password1', 'Password cant be empty').notEmpty();
    req.checkBody('password2','Passwords do not match').equals(req.body.password1);
    req.checkBody('name', 'Name cant be empty').notEmpty();
    req.checkBody('lastname', 'Lastname cant be empty').notEmpty();

    // OPTIONAL TO-DO: RENDER ALL FIELDS WHERE DONT EXIST ERRORS TO THE FORM
    var errors = req.validationErrors();
    if (errors) {
      res.render('users/register', {
        errors: errors
      });
    } else {
      User.getUserByUsername(username, function(err,checkUser){
        if(err){
          console.log("err " + err);
        } else {
          if(!checkUser){
            var newUser = new User({
              username: username,
              password: password1,
              email: email,
              name: name,
              lastname: lastname
            })
            //return done(null, false, { success_msg: 'Username available!' });
            User.create(newUser, function(err,user){
              if(err){
                console.log("Error creating user: " + err);
              }
              res.redirect('login?username='+ encodeURIComponent(username));
            });
          } else {
            res.render('users/register', {
              error_msg: 'Somebody already have that username.', error: errors
            });
          }
        }
      })


    }
};

// LOGIN USERS BY USERNAME
exports.getLogin = function(req, res) {
    var message = "";
    var username = '';
    if(req.headers.referer === nconf.get('development:server')+'users/register' && req.query.username !== undefined){
      message = "Successfulyy create user";
      username = decodeURIComponent(req.query.username);
      res.render('users/login', {success_msg: message, username: username})
    } else {
      res.render('users/login', {username : ''});
    }
};

exports.postLogin = function(req,res,next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.render('users/login', {username: '', error_msg: info.error_msg}); }
    // req / res held in closure
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/profile');
    });
  })(req, res, next);
};

// PROFILE OF A USER
exports.getProfile = function(req, res){
  res.render('users/profile', {user: req.user});
};

exports.postProfile = function(req,res){
    var username = req.body.username;
    var name = req.body.name;
    var lastname = req.body.lastname;
    var email = req.body.email;
    params = {
      username: username,
      name: name,
      lastname: lastname,
      email: email
    }
    User.updateInfo({user: req.user},{params}, function(user){
      res.render('users/profile', {user: req.user, success_msg: 'Información salvada exitosamente'});
    });
};

// LOGOUT
exports.getLogout = function(req, res) {
    req.logout();
    res.redirect('/users/login');
    //res.render('users/login', {username: '', success_msg: 'Loggout successfully.'});
};
