'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var ShortId = require('mongoose-shortid');
var recentPlugin = require('mongoose-recent');
var Schema = mongoose.Schema;
var slugify = require('slugify');
var _ = require('lodash');

var subdocTransform = function(doc, ret) {
  delete ret._id;
  delete ret.__v;
  return ret;
};

var FavoriteEntrySchema = new Schema({
  flow: { type: ShortId, ref: 'Flow'},
  favoritedAt: { type: Date, 'default': Date.now }
});
FavoriteEntrySchema.options.toJSON = { transform: subdocTransform };

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

  favorites: [FavoriteEntrySchema],

  stats: {
    flowsPlayed: { type: Number, 'default': '0' },
    secondsPlayed: { type: Number, 'default': '0' },
    flowsWritten: { type: Number, 'default': '0' },
    moves: { type: Number, 'default': '0' }
  }
});

UserSchema.pre('save', function(next) {
  var self = this;
  if (!self.username) {
    self.username = slugify(self.name.toLowerCase());
  }
  next();
});

UserSchema.statics = {
  loadPublicProfile: function(name) {
    return this.findOne({ username: name })
      .populate('favorites.flow', 'name _id')
      .populate('recentlyPlayed.flow', 'name _id')
      .exec().then(function(user) {
        if (user) {
          return user.toPublic();
        }
      });
  }
};

UserSchema.methods = {
  addFavorite: function(flowId) {
    var found = _.findIndex(this.favorites, function(favorite) {
      return favorite.flow === flowId;
    }) !== -1;
    
    if (!found) {
      this.favorites.push({flow: flowId});
    }

    return this.saveAsync();
  },

  removeFavorite: function(flowId) {
    var filteredFavorites = _.filter(this.favorites, function(favorite) {
      return favorite.flow !== flowId;
    });

    this.favorites = filteredFavorites;
    return this.saveAsync();
  },

  recordFlowWritten: function() {
    this.stats.flowsWritten += 1;
    return this.saveAsync();
  },

  recordPlay: function(flow) {
    this.stats.flowsPlayed += 1;
    this.stats.moves += flow.moves.length;

    var secondsPlayed = _.foldl(flow.moves, function(total, current) {
      return total + current.duration;
    }, 0);

    this.stats.secondsPlayed += secondsPlayed;
    return this.addRecentPlay(flow._id);
  },

  toPublic: function() {
    return {
      id: this._id,
      name: this.name,
      username: this.username,
      profilePictureUrl: this.profilePictureUrl,
      createdAt: this.createdAt,
      stats: this.stats,
      favorites: this.favorites,
      recentlyPlayed: this.recentlyPlayed
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

UserSchema.plugin(recentPlugin, { name: 'flow', schemaType: { type: ShortId, ref: 'Flow' }, collectionPath: 'recentlyPlayed', addFunctionName: 'addRecentPlay' });

module.exports = mongoose.model('User', UserSchema);
