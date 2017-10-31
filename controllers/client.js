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
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

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
      let projects = client.projects.filter((project)=>{
        return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
      });
      res.render('clients/projects', {client: client, projects: projects});
    });
  },
  // AQUI VA EL FILE MANAGER
  getProject: function(req, res){
    let id = req.params.id;
    let projectId = req.params.projectId;
    Client.findById(id, function(err, client){
      if(err) res.render('error', {error:err});
      let projects = client.projects.filter((project)=>{
        return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
      });
      let project = projects.filter((project)=>{
        return project._id.toString() === projectId;
      })[0];
      let projectPath = `./public/system/${client.name}/${project.name}/`;
      let dir = '';
      if(req.query.path){
        dir = projectPath + req.query.path;
      } else {
        dir = projectPath;
      }
      fs.readdir(dir, function(err, filenames) {
        if(err) {
          return res.render('error', {error: err});
        } else {
          return res.render('clients/project', {client: client, dirs: filenames, project: project});;
        }
      });
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
                let path = `./public/${client.name}`;
                mkdirp(path, (err)=>{
                  if(err) return res.render('error', {error: err});
                  else {
                    res.render('admin/clients/new', {success_msg: 'Cliente creado satisfactoriamente', client: client});
                  }
                });
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
    req.checkBody('name','Nombre es requerido').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      res.render('admin/clients/new', {errors: errors});
    } else {
      if(req.params.id){
        let id = req.params.id;
        let name = req.body.name;
        let desc = (req.body.desc)? req.body.desc: '';
        let accessRole = req.body.roles;
        Client.findById(id, function(err, client){
          if(err) res.render('error', {error: err, message: ''});
          else {
            if(client){
              let project = {name: name, desc: desc, accessRole: accessRole};
              Client.createProject(id, project, function(err, client){
                if(err) return res.render('error', {error: err});
                else {
                  if(client){
                    mkdirp(`./public/${client.name}/${project.name}`, (err)=>{
                      if(err) return res.render('error', {error: err})
                      else {
                        let path = `./public/system/${client.name}/${project.name}`;
                        let phases = [
                          `${path}/01.Inicio`,
                          `${path}/02.Planificación`,
                          `${path}/02.Planificación/Cronograma`,
                          `${path}/02.Planificación/Actividades`,
                          `${path}/03.Ejecución/01.Análisis`,
                          `${path}/03.Ejecución/02.Diseño`,
                          `${path}/03.Ejecución/03.Construcción`,
                          `${path}/03.Ejecución/04.Trancisión`,
                          `${path}/03.Ejecución/04.Trancisión/Soporte`,
                          `${path}/03.Ejecución/04.Trancisión/Guias`,
                          `${path}/03.Ejecución/04.Trancisión/Capacitación`,
                          `${path}/03.Ejecución/05.Calidad`,
                          `${path}/04.Seguimiento`,
                          `${path}/04.Seguimiento/Minutas`,
                          `${path}/04.Seguimiento/Informes`,
                          `${path}/04.Seguimiento/ControlHoras`,
                          `${path}/04.Seguimiento/Comunicados`,
                          `${path}/05.Cierre`
                        ];
                        phases.forEach((phase)=>{
                          mkdirp(phase, (err)=>{
                            if(err) return err;
                          });
                        });
                        res.render('admin/clients/new_project', {success_msg:'Creado satisfactoriamente el proyecto ' + project.name, client: client});
                      }
                    });
                  } else {
                    res.render('admin/clients/new_project', {error_msg: 'Ocurrió un error creando el proyecto', client: client});
                  }
                }
              });
            }
          }
        });
      }
    }
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
