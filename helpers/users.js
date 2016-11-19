// Generates hash using bCrypt
// ENCRYPT -> GENERATE HASH
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// DESENCRYPT -> COMPARE HASH
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}
