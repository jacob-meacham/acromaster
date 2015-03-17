'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
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
  provider: String,
  
  facebook: {},
  twitter: {},
  google: {},

  flows: [{ type: ShortId, ref: 'Flow' }],
});

UserSchema.statics = {
  loadPublicProfile: function(name, cb) {
    this.findOne({ name: name })
      .populate('flows')
      .exec(function(err, user) {
        if (err) {
          return cb(err);
        }

        if (!user) {
          return cb(null, null);
        }

        var profile = {
          name: user.name,
          createdAt: user.createdAt,
          flows: user.flows // TODO: Get flows from the DB instead of storing them with the user.
        };

        cb(null, profile);
      });
  }
};

mongoose.model('User', UserSchema);