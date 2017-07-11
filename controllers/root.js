const User = require('../model/user');
const expressValidator = require('express-validator');

 module.exports = {
   getIndex: function (req, res) {
       res.render('index', { user : req.user });
   }
 }
