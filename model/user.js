const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    lastname: String,
    created_at: {type: Date, default: Date.now}
});
var User = module.exports = mongoose.model('User', UserSchema);

//User.plugin(passportLocalMongoose);
module.exports.create = function(newUser, callback) {
  console.log('hello');
  bcrypt.genSalt(8, function(err, salt) {
    console.log('genSalt', salt, err)
    bcrypt.hash(newUser.password, salt, null, function(err, hash) {
      console.log("Entre modelo");
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.updateInfo = function(user, params, callback){
  var u = user.user;
  var p = params.params;
  if(u.username !== p.username){
    u.username = p.username;
  } if(u.name !== p.name){
    u.name = p.name;
  } if(u.lastname !== p.lastname){
    u.lastname = p.lastname;
  } if(u.email !== p.email){
    u.email = p.email;
  }
  User.findOne({username: u.username}, function(data){
    u.save(callback);
  });
};

module.exports.updatePassword = function(user,newPassword, callback){
  bcrypt.genSalt(8, function(err, salt){
    bcrypt.hash(newPassword, salt, function(err,hash){
      if(err){
        console.log("Error en hash of new password");
        callback(null, err);
      } else {
        user.password = hash;
        user.save(callback);
      }
    })
  })
}

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query,callback);
};

module.exports.getUserByEmail = function(email,callback){
  var query = {email: email};
  User.findOne(query, callback);
};

module.exports.getUserById = function(id,callback){
  User.findById(id, callback);
};

module.exports.comparePasswords = function(password, hash, callback){
  bcrypt.compare(password,hash,function(err,isMatch){
    if (err) {
      callback(null, null);
      console.log("Error comparando password");
    } else {
      callback(null, isMatch);
    }
  });
};