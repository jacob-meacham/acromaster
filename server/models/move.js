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
  createdAt : { type: Date, default: Date.now },

  tags: { type: [String], get: getTags, set: setTags },
});

MoveSchema.path('name').validate(function(name) {
  return name.length > 0;
}, "Move name can't be blank");

var Move = mongoose.model('Move', MoveSchema);