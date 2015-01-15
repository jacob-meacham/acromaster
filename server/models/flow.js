'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
  name: { type: String, required: true },
  author: String,
  moves: [{
    move: { type: Schema.Types.ObjectId, ref: 'Move' },
    duration: Number
  }],

  createdAt: { type : Date, default : Date.now },
  official: Boolean,
  ratings: [Number]
});

FlowSchema.statics = {
  load: function(id, cb) {
    this.findOne({ _id: id })
      .populate('moves.move')
      .exec(cb);
  },

  list: function(options, cb) {
    var criteria = options.criteria || {};

    // Sory by creation time by default
    var sortBy = {};
    sortBy[options.sortBy || 'createdAt'] = -1;

    this.find(criteria)
      .populate('moves.move')
      .sort(sortBy)
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }
};

FlowSchema.methods = {
  getRating: function() {
    if (this.ratings.length === 0) {
      return -1;
    }

    var sum = _.reduce(this.ratings, function(memo, num) {
      return memo + num;
    });

    return sum/this.ratings.length;
  }
};

mongoose.model('Flow', FlowSchema);