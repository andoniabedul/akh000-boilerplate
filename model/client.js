const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;

var ProjectSchema = mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true
    },
    name: {type:String, required: true},
    accessRole: {
      type: Array,
      required: true,
      enum: ['specialist', 'manager', 'admin'],
      default: ['manager', 'admin']
    },
    desc : {type: String, required: true},
    created_at: {type: Date, default: Date.now()}
  }
);

var ClientSchema = mongoose.Schema({
    name: {type: String, required: true},
    desc: {type: String},
    address: {type:String},
    domainEmail: {type: String, required: true},
    logo: {type:String},
    projects : [ProjectSchema],
    created_at: {type: Date, default: Date.now}
});



var Client = module.exports = mongoose.model('Client', ClientSchema);

module.exports.listClients = function(callback){
  Client.find((err,result) => {
    if(err) callback(err,null);
    callback(null,result);
  });
}
module.exports.createClient = function(newClient, callback) {
  let client = new Client();
  client.name = newClient.name;
  client.desc = newClient.desc;
  client.address = newClient.address;
  client.domainEmail = newClient.domainEmail;
  client.logo = newClient.logo;
  client.save(callback);
}
module.exports.findClientsById = function(clientsId, callback){
  Client.find({_id: {$in: clientsId}}, function(err, clients){
    if(err) callback(err, null);
    else {
      callback(null, clients);
    }
  });
}

module.exports.findById = function(id, callback){
  let query = {'_id':ObjectID.createFromHexString(id)}
  Client.find(query,(err,result) => {
    if(err) callback(err,null);
    if(result.length === 1){
      callback(null,result[0]);
    }
  });
}

module.exports.findByName = function(name, callback){
  let query = {name: name};
  Client.find(query, function(err, client){
    if(err) callback(err, null);
    else {
      if(client.length > 0){
        callback(null, client);
      } else {
        callback(null, null);
      }
    }
  });
}

module.exports.listProjects = function(id, callback){
  let query = {'_id': ObjectID.createFromHexString(id)};
  Client.find(query, (err, client)=>{
    if(err) callback(err, null);
    callback(null, client.projects);
  });
}

module.exports.createProject = function(idClient, project, callback){
  let query = {'_id': ObjectID.createFromHexString(idClient)};
  Client.findOne(query, (err, client)=>{
    if(err) callback(err, null);
    else {
      if(client){
        let id = mongoose.Types.ObjectId();
        let projects = client.projects;
        project._id = id;
        projects.push(project);
        client.projects = projects;
        client.save();
        callback(null, client);
      } else {
        callback(null, null)
      }
    }
  });
}
