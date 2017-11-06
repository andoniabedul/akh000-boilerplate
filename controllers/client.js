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
const multer = require('multer');
const imgExtension = ['.JPG', '.PNG', '.JPEG']
const docExtension = ['.PDF', '.DOC', '.DOCX', '.XLS','.XLSX','.PPT', '.PPTX'];
const fileExtensionPatter = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/;

let storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    let extension = file.originalname.match(fileExtensionPatter)[0].toUpperCase();
    console.log('extension: ' + extension);
    console.log('destination: ' + imgExtension.includes(extension));
    if(imgExtension.includes(extension)){
      callback(null, './public/images/');
    } else if(docExtension.includes(extension)) {
      callback(null, './public/system/');
    }
  },
  filename: function (req, file, callback) {
    let extension = file.originalname.match(fileExtensionPatter)[0].toUpperCase();
    if(imgExtension.includes(extension)){
      callback(null, 'IMAGE_'+ file.fieldname.toUpperCase() + '_' + Date.now() + extension);
    } else if (docExtension.includes(extension)){
      let pdfDocument = file.originalname.split('_');
      extension = extension.toLowerCase();
      let typeDoc = pdfDocument[0];
      let period = '';
      switch (typeDoc) {
        case 'FAC':
          period = pdfDocument[1].substring(0, 6);
          let year = period.substring(0,4);
          let month = period.substring(4,6);
          if(month < 12 && month > 0 && year > 2014 && year < 2018){
            callback(null, typeDoc + '_' + period + extension);
          } else {
            let error = "Fecha no valida, debe ser con formato AAAAMM, entre 2015 y 2017";
            callback(error, null);
          }
          break;
        case 'COB':
          period = pdfDocument[1].substring(0, 6);
          callback(null, typeDoc + '_' + period + extension);
          break;
        case 'INF':
          period = pdfDocument[1].split('.')[0];
          if(period === 'ANUAL' || period === 'TRIMESTRAL'){
            callback(null, typeDoc + '_' + period + extension);
          } else {
            let error = 'Período no correcto, debe ser ANUAL o TRIMESTRAL';
            callback(error);
          }
          break;
        case 'LEG':
          let type = pdfDocument[1].substring(0, 1);
          if(type < 7 && type > 0){
            callback(null, typeDoc + '_' + type + extension);
          } else {
            let error = 'Formato incorrecto. El formato debe ser LEG_N donde N es un numero del 1 al 6.'
            callback(error, null);
          }
          break;
        case 'ORG':
          callback(null, typeDoc + '_1'+ extension);
          break;
        default:
          let error = 'No se reconoció el tipo de documento.'
          callback(error, null);
      }
    }
  }
});

let uploadLogo = multer({ storage : storage}).single('logo');
let uploadDocument = multer({storage: storage}).single('document');

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
  getProject: function(req, res){
    let id = req.params.id;
    let projectId = req.params.projectId;
    Client.findById(id, function(err, client){
      if(err) res.render('error', {error:err});
      let project = client.projects.filter((project)=>{
        return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
      }).filter((project)=>{
        return project._id.toString() === projectId;
      })[0];
      let projectPath = `./public/system/${client.name}/${project.name}/`;
      let dir = (req.query.path && req.query.path !== '/')? projectPath + req.query.path : projectPath;
      let actualPath = (req.query.path && req.query.path !== '/')? `/${req.query.path}` : '/';
      let pathFolder = actualPath;
      actualPath = (actualPath.length===1)? ['/'] : actualPath.split('/');
      fs.readdir(dir, function(err, folders) {
        if(err) {
          return res.render('error', {error: err});
        } else {
          folders = folders.map((path)=>{
            return {
              folder: fs.statSync(`${dir}/${path}`).isDirectory(),
              name: path,
              path: (req.query.path)? `${req.query.path}/${path}`: path,
              last_modified: fs.statSync(`${dir}/${path}`).mtime,
              size: fs.statSync(`${dir}/${path}`).size
            }
          });
          return res.render('clients/project', {client: client, dirs: folders, pathFolder: pathFolder, actualPath: actualPath, project: project});;
        }
      });
    });
  },
  getNewClient: function(req, res){
    res.render('admin/clients/new');
  },
  postNewClient: function(req, res){
    uploadLogo(req, res, function(err){
      if(err) return res.render('error', {error: err})
      else {
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
                console.log(JSON.stringify(req.files));
                let client = new Client();
                client.name = req.body.name;
                client.address = (req.body.address)? req.body.address:'';
                client.desc = (req.body.desc)? req.body.desc:'';
                client.domainEmail = req.body.domainEmail;
                client.logo = req.file.path;
                Client.createClient(client, function(err, client){
                  if(err) res.render('error', {error:err});
                  else {
                    let path = `./public/${client.name}`;
                    mkdirp(path, (err)=>{
                      if(err) return res.render('error', {error: err});
                      else {
                        res.redirect('/clients');
                      }
                    });
                  }
                });
              }
            }
          });

        }
      }
    });
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
