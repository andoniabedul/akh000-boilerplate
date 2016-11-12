var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  lastname: String,
  user: String,
  password: String,
  created_at: {type: Date, default: Date.now}
});

mongoose.model('User', userSchema);
