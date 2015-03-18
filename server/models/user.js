'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  // TODO: Remove spaces in usernames?
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'], //"
  },
  createdAt: { type: Date, 'default': Date.now },
  provider: String,
  
  facebook: {},
  twitter: {},
  google: {},
});

UserSchema.statics = {
  loadPublicProfile: function(name, cb) {
    console.log('loading profile for ' + name);
    this.findOne({ name: name })
      .exec(function(err, user) {
        if (err) {
          return cb(err);
        }

        if (!user) {
          return cb();
        }

        var profile = {
          _id: user._id,
          name: user.name,
          createdAt: user.createdAt,
        };

        cb(null, profile);
      });
  }
};



mongoose.model('User', UserSchema);