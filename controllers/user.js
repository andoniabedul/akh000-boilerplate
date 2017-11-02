/*
  ********** USER CONTROLLER **********
  This file manage the logic for user module
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
const Client = require('../model/client');

module.exports = {
  getUsers: function(req, res){
    User.getUsers(function(err, users){
      if(err) res.render('users/index', {user: req.user, users: null, error_msg: err});
      res.render('admin/users/users', {user: req.user, users: users});
    })
  },
  getUser: function(req, res){
    let username = req.params.username;
    User.getUserByUsername(username, function(err, user){
      if(err) res.render('error', {user: req.user, error: err});
      Client.findClientsById(user.working_on, function(err, clients){
        if(err) return res.render('error', {error: err});
        else {
          let userClients = clients.map((client)=>{
            return client.name;
          });
          res.render('admin/users/user', {user: req.user, userClients: userClients, requestedUser: user});
        }
      });
    });
  },
  postUser: function(req, res){
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
        res.render('users/profile', {success_msg: 'Información salvada exitosamente'});
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
  getNewUser: function(req, res) {
      Client.listClients(function(err, clients){
        let serializedClients = clients.map((client) => {
          return {_id: client._id, name: client.name}
        });
        res.render('admin/users/create', { user: req.user, clients: serializedClients });
      });

  },
  postNewUser: function(req, res){
    let username = req.body.username;
    let email = req.body.email;
    let role = req.body.role;
    let working_on = req.body.working_on;
    let name = req.body.name;
    let lastname = req.body.lastname;
    let password1 = req.body.password1;
    let password2 = req.body.password2;
    let phone = req.body.phone;

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
      res.render('admin/users/create', {errors: errors});
    } else {
      User.getUserByUsername(username, function(err, checkUser){
        if(err){
          console.log("err " + err);
        } else {
          if(!checkUser){
            let newUser = new User({
              username: username,
              password: password1,
              working_on: working_on,
              email: email,
              name: name,
              lastname: lastname,
              phone: phone
            })
            User.create(newUser, function(err,user){
              if(err){
                console.log("Error creating user: " + err);
              }
              res.redirect('/admin/users');
            });
          } else {
            res.render('admin/users/create', {
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
    if(req.headers.referer === config.development+'admin/users/create' && req.query.username !== undefined){
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
    res.render('users/profile');
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
        res.render('users/profile', {success_msg: 'Información salvada exitosamente'});
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
