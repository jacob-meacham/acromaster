'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;

var getTags = function(tags) {
  return tags.join(',');
};

var setTags = function(tags) {
  return tags.split(',');
};

var MoveSchema = new Schema({
  _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  name: {type: String, required: true },
  audioUri: String,
  descriptionUrl: String,
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

    return this.find(criteria)
      .sort('name')
      .exec(cb);
  }
};

MoveSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

module.exports = mongoose.model('Move', MoveSchema);