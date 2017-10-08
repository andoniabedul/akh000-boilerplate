/*
  ********** ROOT CONTROLLER **********
  This file manage the logic for root module
  - Methods: (#HTTP_METHOD)
    #GET ROOT
*/
const User = require('../model/user');
const expressValidator = require('express-validator');
const Client = require('../model/client');

 module.exports = {
   getIndex: function (req, res) {
     Client.listClients(function(err, result){
       if(err) res.render('error', {error:err});
       res.render('index', {clients: result});
     });
   },
   getAdminIndex: function(req, res){
     res.render('admin/index');
   }
 }
