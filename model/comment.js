const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectID = require('mongodb').ObjectID;
const User = require('./user');
const CommentSchema = mongoose.Schema({
    desc: {type: String, required: true, trim: true},
    document_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    created_at: {type: Date, default: Date.now},
    created_by: {
      _id: {type: mongoose.Schema.Types.ObjectId, required: true},
      username:{type: String, required: true},
      photo: {type: String, required: true}
    },
});

const Comment = module.exports = mongoose.model('Comment', CommentSchema);


module.exports.create = function(newComment, callback){
  let comment = new Comment();
  comment.desc = newComment.desc;
  comment.document_id = newComment.document_id;
  comment.created_by = newComment.created_by;
  comment.save();
  callback(null, comment);
}

module.exports.listByDocument = function(idDocument, callback){
  let query = {document_id: ObjectID.createFromHexString(idDocument)};
  Comment.find(query, (err, comments)=>{
    if(err) return callback(err, null)
    else {
      callback(null, comments);
    }
  });
}
