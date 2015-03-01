'use strict';

var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;

shortId.characters('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
var UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
    index: true,
    unique: true,
    'default': shortId.generate
  },
  name: {
    type: String,
    required: true
  },
  username: String,
  email: {
    type: String,
    unique: true,
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'], //"
  },
  createdAt: { type: Date, 'default': Date.now },
  provider: String,
  
  facebook: {},
  twitter: {},
  google: {}
});

mongoose.model('User', UserSchema);