/*
  ********** CLIENT CONTROLLER **********
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
const auth = require('../middleware/auth');
const Client = require('../model/client');

module.exports = {
  getClients: function(req, res){
    Client.listClients(function(err, result){
      if(err) res.render('error', {error:err});
      res.render('clients/index', {clients: result});
    });
  },
  getClient: function(req, res){
    let id = req.params.id;
    Client.findById(id, function(err, client){
      if(err) res.render('error', {error:err});
      projects = client.projects.filter((project)=>{
        return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
      });
      res.render('clients/projects', {client: client, projects: projects});
    });
  },
  // AQUI VA EL FILE MANAGER
  getProject: function(req, res){

  },
  getNewClient: function(req, res){
    res.render('clients/new');
  },
  postNewClient: function(req, res){

  },
  getNewProject: function(req, res){

  },
  postNewProject: function(req, res){

  },
  getEditClient: function(req, res){

  },
  postEditClient: function(req, res){

  },
  getEditProject: function(req, res){

  },
  postEditProject: function(req, res){

  }
}
