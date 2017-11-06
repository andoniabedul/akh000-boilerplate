const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const passportLocalMongoose = require('passport-local-mongoose');
const ObjectID = require('mongodb').ObjectID;

const DocumentSchema = mongoose.Schema({
    _id:{
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: false
    },
    name: {type: String, required: true, trim: true},
    path: {type: String, required: true},
    extension: {type: String, required: true},
    client_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    project_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    created_at: {type: Date, default: Date.now},
    created_by: {type: mongoose.Schema.Types.ObjectId, required: true },
    version: {type: Number, default: 1 },
    modified_by: {type: mongoose.Schema.Types.ObjectId}
});

const Document = module.exports = mongoose.model('Document', DocumentSchema);

module.exports.create = function(newDoc, user, callback){
  let doc = new Document();
  doc._id = mongoose.Types.ObjectId();
  doc.name = newDoc.name.substr(0, newDoc.name.lastIndexOf('.')) || newDoc.name;
  doc.extension = newDoc.extension;
  doc.path = `${newDoc.path}/${newDoc.name}_${doc._id.toString()}${doc.extension}`;
  doc.client_id = newDoc.client_id;
  doc.project_id = newDoc.project_id;
  doc.created_by = user.toString();
  doc.save(callback);
}

module.exports.findById = function(id, callback){
  let query = {_id: id};
  Document.findOne(query, function(err, doc){
    if(err) return callback(err, null)
    else {
      callback(null, doc);
    }
  });
}
