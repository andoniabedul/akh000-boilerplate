const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const router = express.Router();
const flash = require('connect-flash');
const User = require('../model/user');


exports.getIndex = function(req,res){
    res.render('index', { user : req.user });
}

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    console.log("auth");
    return next();
  } else {
    res.render('users/login', {username:'', error_msg: 'Debes estar logueado'});
  }
}
