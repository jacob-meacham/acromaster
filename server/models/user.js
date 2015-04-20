'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;
var slugify = require('slugify');
var _ = require('lodash');

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

        var profile = user.toPublic();
        cb(null, profile);
      });
  }
};

UserSchema.methods = {
  addFavorite: function(flowId, cb) {
    var found = _.findIndex(this.favorites, function(favorite) {
      return favorite.flow === flowId;
    }) !== -1;
    
    if (found) {
      // TODO: Not atomic, not sure if $addToSet is atomic either
      this.favorites.push({flow: flowId});
    }
    this.save(cb);
  },

  removeFavorite: function(flowId, cb) {
    var filteredFavorites = _.filter(this.favorites, function(favorite) {
      return favorite.flow !== flowId;
    });

    this.favorites = filteredFavorites;
    this.save(cb);

    // TODO: Is this better? this.favorites.pull doesn't work, requires an actual update call.
    // this.update({$pull: { favorites: { flow: flowId}}}, function(err) {
    //   if (err) {
    //     return cb(err);
    //   }

         // This is not correct, want the actual object
    //   return cb(null, this);
    // });
  },

  toPublic: function() {
    return {
      id: this._id,
      name: this.name,
      username: this.username,
      profilePictureUrl: this.profilePictureUrl,
      createdAt: this.createdAt
    };
  }
};


UserSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

module.exports = mongoose.model('User', UserSchema);
 