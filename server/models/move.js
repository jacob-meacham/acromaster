'use strict';

var mongoose = require('mongoose');
var shortId = require('shortid');
var Schema = mongoose.Schema;

shortId.characters('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
var getTags = function(tags) {
  return tags.join(',');
};

var setTags = function(tags) {
  return tags.split(',');
};

var MoveSchema = new Schema({
    _id: {
    type: String,
    required: true,
    index: true,
    unique: true,
    'default': shortId.generate
  },
  name: {type: String, required: true },
  audioUri: String,
  difficulty: {type: Number, default: 5},
  aliases: [String],

  tags: { type: [String], get: getTags, set: setTags },
});

MoveSchema.path('name').validate(function(name) {
  return name && name.length > 0;
}, 'Move name can\'t be blank');

MoveSchema.statics = {
  list: function(options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .sort('name')
      .exec(cb);
  }
};

mongoose.model('Move', MoveSchema);