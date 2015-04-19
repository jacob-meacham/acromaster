'use strict';

var mongoose = require('mongoose');
var ShortId = require('mongoose-shortid');
var likesPlugin = require('mongoose-likes');
var randomPlugin = require('mongoose-random');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
    _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  name: { type: String, required: true },
  description: { type: String },
  authorName: { type: String },
  author: { type: ShortId, ref: 'User' },

  moves: [{
    move: { type: ShortId, ref: 'Move' },
    duration: Number
  }],

  createdAt: { type : Date, default : Date.now },
  official: Boolean,

  plays: { type: Number, default : 0 },
  players: [{type: ShortId, ref: 'User'}]
});

FlowSchema.index({ name: 'text', description: 'text', authorName: 'text' });

FlowSchema.statics = {
  load: function(id, cb) {
    return this.findOne({ _id: id })
      .populate('author', 'name _id')
      .populate('moves.move')
      .exec(cb);
  },

  list: function(options, cb) {
    var searchQuery = options.searchQuery || {};

    // Sory by creation time by default
    var sortBy = {};
    sortBy[options.sortBy || 'createdAt'] = -1;

    return this.find(searchQuery, options.score)
      .populate('author')
      .populate('moves.move')
      .sort(sortBy)
      .limit(options.max)
      .skip(options.max * options.page)
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

FlowSchema.plugin(randomPlugin, { path: '__random'});

// TODO: Need to test this
FlowSchema.pre('remove', function(next) {
  this.model('User').update(
      { 'favorites.flow': this._id },
      { $pull: { 'favorites.flow': this._id} },
      { multi: true },
      next);
});

FlowSchema.options.toJSON = {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__random;
    delete ret.__v;
    delete ret.authorName; // Not required in return
    return ret;
  }
};

module.exports = mongoose.model('Flow', FlowSchema);