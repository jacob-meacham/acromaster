'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var likesPlugin = require('mongoose-likes');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
    _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  name: { type: String, required: true },
  author: { type: ShortId, ref: 'User' },

  // TODO: Should just be in here, since moves are static?
  moves: [{
    move: { type: ShortId, ref: 'Move' },
    duration: Number
  }],

  createdAt: { type : Date, default : Date.now },
  official: Boolean,

  plays: Number,
  players: [{type: ShortId, ref: 'User'}]
});

FlowSchema.plugin(likesPlugin);

FlowSchema.statics = {
  load: function(id, cb) {
    this.findOne({ _id: id })
      .populate('author', 'name _id')
      .populate('moves.move')
      .exec(cb);
  },

  list: function(options, cb) {
    var criteria = options.criteria || {};

    // Sory by creation time by default
    var sortBy = {};
    sortBy[options.sortBy || 'createdAt'] = -1;

    this.find(criteria)
      .populate('author')
      .populate('moves.move')
      .sort(sortBy)
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },

  listByUser : function(author_id, cb) {
    this.find({author: author_id}, '_id name author createdAt ratings')
      .sort('createdAt')
      .limit(1000)
      .exec(cb);
  }
};

mongoose.model('Flow', FlowSchema);