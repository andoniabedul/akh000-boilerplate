const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
    query: {type: String, required: true},
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
  doc.query = `${doc.name}_${doc._id}${doc.extension} `
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

module.exports.lastUploadedByUser = function(userId, callback){
  let query = {created_by: ObjectID.createFromHexString(userId)}
  Document.find(query).sort('-date').limit(5).exec(function(err, documents){
    if(err) callback(err, null);
    else {
      callback(null, documents.reverse());
    }
  });
}

module.exports.modify = function(documentId, path, user, callback){
  let query = {_id: ObjectID.createFromHexString(documentId)}
  Document.findOne(query, function(err, doc){
    if(err) return callback(err, null)
    else {
      if(doc){
        doc.path = path;
        doc.version++;
        doc.modified_by = ObjectID.createFromHexString(user);
      } else {
        let error = 'No existe este documento';
        callback(error, null);
      }
    }
  });
}
