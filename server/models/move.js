'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var getTags = function(tags) {
  return tags.join(',');
};

var setTags = function(tags) {
  return tags.split(',');
};

var MoveSchema = new Schema({
  name: {type: String, required: true },
  audioUri: String,

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