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
     if(req.user.role==='admin'){
       Client.listClients(function(err, clients){
         if(err) return res.render('error', {error: err})
         else {
           res.render('index', {clients: clients});
         }
       });
     } else {
       Client.findClientsById(req.user.working_on,function(err, clients){
         if(err) res.render('error', {error:err});
         res.render('index', {clients: clients});
       });
     }
   },
   getAdminIndex: function(req, res){
     if(req.user.role==='admin'){
       Client.listClients(function(err, clients){
         if(err) return res.render('error', {error: err})
         else {
           User.getUsers(function(err, users){
             if(err) return res.render('error', {error: err})
             else {
               res.render('admin/index', {clients: clients, users: users});
             }
           });
         }
       });
     } else {
       res.render('index', {error: 'No posees los permisos para ver esa página'})
     }
   }
 }
