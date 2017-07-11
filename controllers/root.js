/*
  ********** ROOT CONTROLLER **********
  This file manage the logic for root module
  - Methods: (#HTTP_METHOD)
    #GET ROOT
*/
const User = require('../model/user');
const expressValidator = require('express-validator');

 module.exports = {
   getIndex: function (req, res) {
       res.render('index');
   }
 }
