'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var ShortId = require('mongoose-shortid');
var likesPlugin = require('mongoose-likes');
var randomPlugin = require('mongoose-random');
var Schema = mongoose.Schema;

var subdocTransform = function(doc, ret) {
  delete ret._id;
  delete ret.__v;
  return ret;
};

var MoveEntrySchema = new Schema({
  move: { type: ShortId, ref: 'Move' },
  duration: Number,
});
MoveEntrySchema.options.toJSON = { transform: subdocTransform };

var PlayEntrySchema = new Schema({
  player: {type: ShortId, ref: 'User'},
  date: { type: Date, 'default': Date.now },
});
PlayEntrySchema.options.toJSON = { transform: subdocTransform };

var FlowSchema = new Schema({
    _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  name: { type: String, required: true },
  description: { type: String },
  authorName: { type: String },
  author: { type: ShortId, ref: 'User' },

  moves: [MoveEntrySchema],

  createdAt: { type : Date, default : Date.now },
  official: Boolean,
  workout: {type: Boolean, default: false },

  playCount: { type: Number, default : 0 },
  plays: [PlayEntrySchema]
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

    return this.find(searchQuery, null, options.score)
      .populate('author')
      .populate('moves.move')
      .sort(sortBy)
      .limit(options.max)
      .skip(options.max * options.page)
      .exec(cb);
  },

  listByUser: function(author_id, options) {
    return this.find({author: author_id}, '_id name author createdAt ratings')
      .sort({createdAt: -1})
      .limit(options.max)
      .skip(options.max * options.page)
      .exec();
  },

  countByUser: function(author_id) {
    return this.count({author: author_id}).exec();
  }
};

FlowSchema.methods = {
  recordPlayed: function(userId, cb) {
    var update = {
      $addToSet: {
        plays: { player: userId }
      },
      $inc: {
        playCount: 1
      }
    };

    return this.update(update).exec(cb);
  }
};

FlowSchema.plugin(likesPlugin, {
  disableDislikes: true,
  likerIdType: ShortId,
  indexed: true
});

FlowSchema.plugin(randomPlugin, { path: '__random'});

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
    delete ret.plays;
    return ret;
  }
};

module.exports = mongoose.model('Flow', FlowSchema);