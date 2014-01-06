'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
  name: String,
  author: String,
  moves: [{
    move: { type: Schema.Types.ObjectId, ref: 'Move' },
    duration: Number
  }],

  createdAt: { type : Date, default : Date.now }
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

mongoose.model('Flow', FlowSchema);