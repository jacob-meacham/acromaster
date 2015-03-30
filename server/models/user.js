'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;
var slugify = require('slugify');

var UserSchema = new Schema({
  _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  username: {
    // username is a url-safe version of the display name
    // and is required (added by the pre-save middleware)
    type: String,
    unique: true
  },
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
  profilePictureUrl: String,
  provider: String,
  
  facebook: {},
  twitter: {},
  google: {},

  favorites: [{
    flow: { type: ShortId, ref: 'Flow'},
    favoritedAt: { type: Date, 'default': Date.now }
  }]
});

UserSchema.pre('save', function(next) {
  var self = this;
  if (!self.username) {
    self.username = slugify(self.name.toLowerCase());
  }
  next();
});

UserSchema.statics = {
  loadPublicProfile: function(name, cb) {
    this.findOne({ username: name })
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
          username: user.username,
          profilePictureUrl: user.profilePictureUrl,
          createdAt: user.createdAt,
        };

        cb(null, profile);
      });
  }
};

UserSchema.methods = {
  addFavorite: function(flowId) {
    // TODO, add favorite
    console.log(flowId);
  },

  removeFavorite: function(flowId) {
    // Remove favorite
    console.log(flowId);
  }
};


mongoose.model('User', UserSchema);