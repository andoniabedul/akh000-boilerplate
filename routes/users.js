const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');
const nconf = require('nconf');
nconf.file('./config/data.json');

// CHECK IF IS AUTHENTICATED
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    console.log("auth");
    return next();
  } else {
    res.render('users/login', {username:'', error_msg: 'Debes estar logueado'});
  }
}

// REGISTER USERS BY USERNAME
router.get('/register', function(req, res) {
    res.render('users/register');
});

router.post('/register', function(req, res) {
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
});

// LOGIN USERS BY USERNAME
router.get('/login', function(req, res) {
    var message = "";
    var username = '';
    if(req.headers.referer === nconf.get('development:server')+'users/register' && req.query.username !== undefined){
      message = "Successfulyy create user";
      username = decodeURIComponent(req.query.username);
      res.render('users/login', {success_msg: message, username: username})
    } else {
      res.render('users/login', {username : ''});
    }
});

router.post('/login', function(req,res,next){
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
});

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

// PROFILE OF A USER
router.get('/profile', ensureAuthenticated, function(req, res){
  res.render('users/profile', {user: req.user});
});

router.post('/profile', ensureAuthenticated, function(req,res){
    if(Object.hasOwnProperty.call(req.body, "info")){
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
    } else if (Object.hasOwnProperty.call(req.body, "password")) {
      var oldPassword = req.body.oldPassword;
      var newPassword = req.body.newPassword1;
      var repeatNewPassword = req.body.newPassword2;
      req.checkBody('oldPassword', 'Password cant be empty').notEmpty();
      req.checkBody('newPassword1','Passwords do not match').equals(req.body.newPassword2);
      var errors = req.validationErrors();
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
                    success_msg: 'Password actualizado satisfactoriamente'
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
});

// LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/users/login');
    //res.render('users/login', {username: '', success_msg: 'Loggout successfully.'});
});


router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});



module.exports = router;
