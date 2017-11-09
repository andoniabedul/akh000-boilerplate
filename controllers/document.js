/*
  ********** DOCUMENT CONTROLLER **********
  This file manage the logic for root module
  - Methods: (#HTTP_METHOD)
    #GET ROOT
*/
const User = require('../model/user');
const expressValidator = require('express-validator');
const Client = require('../model/client');
const Document = require('../model/document');
const Comment = require('../model/comment');
const multer = require('multer');
const imgExtension = ['.JPG', '.PNG', '.JPEG']
const docExtension = ['.PDF', '.DOC', '.DOCX', '.XLS','.XLSX','.PPT', '.PPTX'];
const fileExtensionPatter = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/;

let storage =  multer.diskStorage({
  destination: function (req, file, callback) {
    let extension = file.originalname.match(fileExtensionPatter)[0].toUpperCase();
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
      if(req.query.clientId && req.query.projectId && req.query.client && req.query.project && req.query.actualPath){
        let client = req.query.client;
        let project = req.query.project;
        let actualPath = req.query.actualPath;
        let newDoc = new Object();
        newDoc.name = file.originalname.substr(0, file.originalname.lastIndexOf('.')) || file.originalname;
        newDoc.extension = extension;
        newDoc.path = `${client}/${project}${actualPath}`;
        newDoc.client_id = req.query.clientId;
        newDoc.project_id = req.query.projectId;
        Document.create(newDoc, req.user._id, function(err, doc){
          if(err) return callback(err, null)
          else {
            callback(null, doc.path);
          }
        });
      } else {
        let error = 'Parametros requeridos no enviados'
        callback(error, null);
      }
    }
  }
});

let uploadDocument = multer({storage: storage}).single('file');

 module.exports = {
   getDocument: function (req, res) {
     let id = req.params.id.substr(0, req.params.id.lastIndexOf('.')).split('_');
     id = id[id.length - 1];
     Document.findById(id, function(err, doc){
       if(err) res.render('error', {error:err});
       Client.findById(doc.client_id.toString(), function(err, client){
         if(err) return res.render('error', {error: err})
         else {
           let project = client.projects.filter((project)=>{
             return project.accessRole.includes(req.user.role) === true || req.user.role === "admin";
           }).filter((project)=>{
             return project._id.toString() === doc.project_id.toString();
           })[0];
           Comment.listByDocument(doc._id.toString(), function(err, comments){
             if(err) return res.render('error', {error: err});
             else {
               console.log(JSON.stringify(comments));
               User.findById(doc.created_by.toString(), function(err, userCreator){
                 if(err) return res.render('error', {error: err})
                 else {
                   res.render('documents/index', {document: doc, comments: comments, creator: userCreator, client: client, project: project});
                 }
               });
             }
           });
         }
       });
     });
   },
   postDocument: function(req, res){
     uploadDocument(req, res, function(err){
       if(err) return console.log(err);
       else {
         res.redirect('/clients');
       }
     });
   },
   postComment: function(req, res){
     req.checkBody('comment','El comentario es requerido').notEmpty();
     let errors = req.validationErrors();
     if (errors) {
       res.render('error', {error: errors});
     } else {
       let newComment = new Object();
       newComment.desc = req.body.comment;
       newComment.created_by = {};
       newComment.created_by._id = req.user._id.toString();
       newComment.created_by.username = req.user.username;
       newComment.created_by.photo = req.user.photo;
       newComment.document_id = req.body.document_id;
       Document.findById(newComment.document_id, function(err, doc){
         if(err) return res.render('error', {error: err})
         else {
           Comment.create(newComment, function(err, comment){
             if(err) return res.render('error', {error: err})
             else {
               res.redirect('/documents/'+doc.query);
             }
           });
         }
       });

     }
   },
   postModifyDocument: function(req, res){
     
   }
 }
