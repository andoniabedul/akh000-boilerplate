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
    if(req.user.role === "admin"){
      Client.listClients(function(err, result){
        if(err) res.render('error', {error:err});
        res.render('clients/index', {clients: result});
      });
    } else {
      Client.findClientsById(req.user.working_on, function(err, clients){
        if(err) res.render('error', {error: err});
        else {
          res.render('clients/index', {clients: clients})
        }
      });
    }
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
    let id = req.params.id;
    Client.findById(id, function(err, client){
      if(err) res.render('error', {error:err});
      projects = client.projects.filter((project)=>{
        return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
      });
      res.render('clients/project', {client: client, projects: projects});
    });
  },
  getNewClient: function(req, res){
    res.render('admin/clients/new');
  },
  postNewClient: function(req, res){
    req.checkBody('name','Nombre es requerido').notEmpty();
    req.checkBody('domainEmail', 'Dominio de correo es requerido').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      res.render('admin/clients/new', {errors: errors});
    } else {
      Client.findByName(req.body.name, function(err, client){
        if(err) res.render('error', {error: err});
        else {
          if(client){
            res.render('admin/clients/new', {error_msg: 'Ya existe un cliente con ese nombre'});
          } else {
            let client = new Client();
            client.name = req.body.name;
            client.address = (req.body.address)? req.body.address:'';
            client.desc = (req.body.desc)? req.body.desc:'';
            client.domainEmail = req.body.domainEmail;
            Client.createClient(client, function(err, client){
              if(err) res.render('error', {error:err});
              else {
                res.render('admin/clients/new', {success_msg: 'Cliente creado satisfactoriamente', client: client});
              }
            });
          }
        }
      });
    }
  },
  getNewProject: function(req, res){
    let id = req.params.id;
    Client.findById(id, function(err, client){
      if(err) res.render('error', {error:err});
      res.render('admin/clients/new_project.ejs', {client: client});
    });

  },
  postNewProject: function(req, res){
    let id = req.params.id;
    Client.findById(id, function(err, client){
      if(err) res.render(error, {error: err});
      else {
        if(client){
          let projects = client.projects;
        }
      }
    });

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
