/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

// Define schema
var UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  salt: { type: String, required: true },
  hash: { type: String, required: true }
});

UserSchema.statics.register = function(email, password, done){
  var User = this;  
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(){}, function(err, hash) {
      if(err) throw err;

      User.create({                
        email : email,
        salt : salt,
        hash : hash
      }, function(err, user){
        if(err) throw err;     
        done(null, user);
      });
    })
  })
};

UserSchema.methods.setPassword = function (password, done) {
  var that = this;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(){}, function(err, hash) {
      that.hash = hash;
      that.salt = salt;
      done(that);
    });
  });
}

UserSchema.statics.isValidUserPassword = function(email, password, done) {
  this.findOne({email : email}, function(err, user){
    // if(err) throw err;
    if(err) return done(err);
    if(!user) return done(null, false, { message : 'Incorrect email.' });
    bcrypt.hash(password, user.salt, function(){}, function(err, hash) {      
      if(err) return done(err);
      if(hash == user.hash) return done(null, user);
      done(null, false, {
        message : 'Incorrect password'
      });
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
