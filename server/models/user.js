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

  // TODO: This might take a long time to return all of these...
  favorites: [{
    flow: { type: ShortId, ref: 'Flow'},
    favoritedAt: { type: Date, 'default': Date.now }
  }],

  // TODO: This might take a long time to return all of these...
  recentlyPlayed: [{
    flow: { type: ShortId, ref: 'Flow'},
    date: { type: Date, 'default': Date.now }
  }],

  stats: {
    flowsPlayed: { type: Number, 'default': 0 },
    minutesPlayed: { type: Number, 'default': 0 },
    flowsWritten: { type: Number, 'default': 0 },
    moves: { type: Number, 'default': 0 }
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
  loadPublicProfile: function(name, cb) {
    this.findOne({ username: name })
      .populate('favorites.flow', 'name _id')
      .populate('recentlyPlayed.flow', 'name _id')
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
    
    if (!found) {
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

  // TODO: Change this to just search the Flows instead?
  recordFlowWritten: function(cb) {
    this.stats.flowsWritten.$inc();
    return this.save().exec(cb);
  },

  recordPlay: function(flow, cb) {
    this.stats.flowsPlayed.$inc();
    this.stats.movesPlayed += flow.moves.length;

    var minutesPlayed = _.foldl(flow.moves, function(total, current) {
      return total + current.duration;
    }, 0);

    this.stats.minutesPlayed += minutesPlayed;

    var found = _.findIndex(this.recentlyPlayed, function(entry) {
      return entry.flow === flow._id;
    }) !== -1;
    
    if (!found) {
      // TODO: Not atomic, not sure if $addToSet is atomic either
      this.recentlyPlayed.push({flow: flow._id});
    }

    // TODO: Sort?
    if (this.recentlyPlayed.length > 10) {
      this.recentlyPlayed = this.recentlyPlayed.slice(1, this.recentlyPlayed.length);
    }

    return this.save().exec(cb);
  },

  toPublic: function() {
    return {
      id: this._id,
      name: this.name,
      username: this.username,
      profilePictureUrl: this.profilePictureUrl,
      createdAt: this.createdAt,
      stats: this.stats,
      favorites: this.favorites
    };
  }
};


UserSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    _.forEach(ret.favorites, function(favorite) {
      delete favorite._id;
    });
    return ret;
  }
};

module.exports = mongoose.model('User', UserSchema);
 