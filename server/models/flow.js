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

FlowSchema.statics = {
  load: function(id, cb) {
    return this.findOne({ _id: id })
      .populate('author', 'name _id')
      .populate('moves.move')
      .exec(cb);
  },

  list: function(options, cb) {
    var criteria = options.criteria || {};

    // Sory by creation time by default
    var sortBy = {};
    sortBy[options.sortBy || 'createdAt'] = -1;

    return this.find(criteria)
      .populate('author')
      .populate('moves.move')
      .sort(sortBy)
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },

  listByUser : function(author_id, cb) {
    return this.find({author: author_id}, '_id name author createdAt ratings')
      .sort('createdAt')
      .limit(1000)
      .exec(cb);
  }
};

FlowSchema.methods = {
  recordPlayed: function(userId, cb) {
    var update = {
      $addToSet: {
        players: userId
      },
      $inc: {
        plays: 1
      }
    };

    return this.model('Flow').findByIdAndUpdate(this._id, update, cb);
  }
};

FlowSchema.plugin(likesPlugin, {
  disableDislikes: true,
  likerIdType: ShortId,
  indexed: true
});


FlowSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

module.exports = mongoose.model('Flow', FlowSchema);