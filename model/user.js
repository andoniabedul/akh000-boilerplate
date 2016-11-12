const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    name: String,
    lastname: String,
    created_at: {type: Date, default: Date.now}
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);
