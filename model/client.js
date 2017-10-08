const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;

var ProjectSchema = mongoose.Schema({
    name: {type:String, required: true},
    accessRole: {
      type: Array,
      required: true,
      enum: ['specialist', 'manager', 'admin'],
      default: ['manager', 'admin']
    },
    beginDate: {type: Date, default: Date.now()},
    endDate: {type: Date, default: Date.now()},
    manager: {type: String}
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

module.exports.findById = function(id, callback){
  let query = {'_id':ObjectID.createFromHexString(id)}
  Client.find(query,(err,result) => {
    if(err) callback(err,null);
    if(result.length === 1){
      callback(null,result[0]);
    }
  });
}

module.exports.listProjects = function(idClient, callback){
  let query = {'_id': ObjectID.createFromHexString(id)};
  Client.find(query, (err, client)=>{
    if(err) callback(err, null);
    callback(null, client.projects);
  });
}
