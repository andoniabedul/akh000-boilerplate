/*
  ********** USER CONTROLLER **********
  This file manage the logic for user logic
  - Methods: (#HTTP_METHOD)
    #GET REGISTER
    #POST REGISTER
    #GET lOGIN
    #POST LOGIN
    #GET PROFILE
    #POST PROFILE
    #GET LOGOUT
*/
const config = require('../config/env.json')[process.env.NODE_ENV || 'development'];
const User = require('../model/user');
const expressValidator = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// PASSPORT LOCAL STRATEGY
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
module.exports = {
  getRegister: function(req, res) {
      res.render('users/register');
  },
  postRegister: function(req, res){
    let username = req.body.username;
    let email = req.body.email;
    let name = req.body.name;
    let lastname = req.body.lastname;
    let password1 = req.body.password1;
    let password2 = req.body.password2;

    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('email','Email not valid').isEmail();
    req.checkBody('email','Email cant be empty').notEmpty();
    req.checkBody('password1', 'Password cant be empty').notEmpty();
    req.checkBody('password2','Passwords do not match').equals(req.body.password1);
    req.checkBody('name', 'Name cant be empty').notEmpty();
    req.checkBody('lastname', 'Lastname cant be empty').notEmpty();

    // OPTIONAL TO-DO: RENDER ALL FIELDS WHERE DONT EXIST ERRORS TO THE FORM
    let errors = req.validationErrors();
    if (errors) {
      res.render('users/register', {errors: errors});
    } else {
      User.getUserByUsername(username, function(err, checkUser){
        if(err){
          console.log("err " + err);
        } else {
          if(!checkUser){
            let newUser = new User({
              username: username,
              password: password1,
              email: email,
              name: name,
              lastname: lastname
            })
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
  },
  getLogin: function(req,res){
    let message = "";
    let username = '';
    if(req.headers.referer === config.development+'users/register' && req.query.username !== undefined){
      message = "Successfulyy create user";
      username = decodeURIComponent(req.query.username);
      res.render('users/login', {success_msg: message, username: username})
    } else {
      res.render('users/login', {username : ''});
    }
  },
  postLogin: function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) {
        return res.render('users/login', {username: '', error_msg: info.error_msg})
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/users/profile');
      });
    })(req, res, next);
  },
  getProfile: function(req,res){
    res.render('users/profile', {user: req.user});
  },
  postProfile: function(req, res){
    if(Object.hasOwnProperty.call(req.body, "info")){
      let username = req.body.username;
      let name = req.body.name;
      let lastname = req.body.lastname;
      let email = req.body.email;
      let params = {
        username: username,
        name: name,
        lastname: lastname,
        email: email
      }
      User.updateInfo({user: req.user},{params}, function(user){
        res.render('users/profile', {user: req.user, success_msg: 'Información salvada exitosamente'});
      });
    } else if (Object.hasOwnProperty.call(req.body, "password")) {
      let oldPassword = req.body.oldPassword;
      let newPassword = req.body.newPassword1;
      let repeatNewPassword = req.body.newPassword2;

      req.checkBody('oldPassword', 'Password cant be empty').notEmpty();
      req.checkBody('newPassword1','Passwords do not match').equals(req.body.newPassword2);
      let errors = req.validationErrors();
      if (errors) {
        res.render('users/profile', {
          errors: errors
        });
      } else {
        User.comparePasswords(oldPassword,req.user.password, function(err,isMatch){
          if(err){
            console.log("Error: " + err);
          } else {
            if(isMatch){
              console.log("El password coincide");
              User.updatePassword(req.user, newPassword, function(err,updated){
                if(err){
                  console.log("Error updating password: " + err);
                  res.render('users/profile', {
                    error_msg: 'Error actualizando password'
                  });
                } else {
                  res.render('users/profile', {
                    success_msg: 'Password actualizado satisfactoriamente',
                    user: updated
                  });
                }
              });
            } else {
              console.log("El password no coincide");
            }
          }
        });
      }
    }
  },
  getLogout: function(req, res){
    req.logout();
    res.redirect('/users/login');
  }
}
