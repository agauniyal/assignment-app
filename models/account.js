// default schema for mongoose connection

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String, // NOTE: don't set password to unique or required, password isn't stored in db, salt and hash is
  college: String,
  degree: String,
  completedProfile: { type: Boolean, default: false }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
