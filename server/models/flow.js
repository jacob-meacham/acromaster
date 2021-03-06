'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var _ = require('lodash');
var ShortId = require('mongoose-shortid');
var likesPlugin = require('mongoose-likes');
var randomPlugin = require('mongoose-random');
var Schema = mongoose.Schema;

var moveEntryTransform = function(doc, ret) {
  delete ret._id;
  delete ret.__v;
  return ret;
};

var MoveEntrySchema = new Schema({
  move: { type: ShortId, ref: 'Move' },
  duration: Number,
});

MoveEntrySchema.options.toJSON = { transform: moveEntryTransform };

var FlowSchema = new Schema({
  _id: {
    type: ShortId,
    alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  name: { type: String, required: true },
  imageUrl: String,
  description: String,
  authorName: String,
  author: { type: ShortId, ref: 'User' },

  moves: [MoveEntrySchema],
  numMoves: { type: Number, default: 0 }, // TODO: Remove this and calculate it on the fly?
  length: { type: Number, default: 0 },
  difficulty: { type: Number, default: 5 },

  createdAt: { type: Date, default: Date.now },
  workout: { type: Boolean, default: false },

  playCount: { type: Number, default: 0 },
  plays: [{ type: ShortId, ref: 'User' }]
});

FlowSchema.index({ name: 'text', description: 'text', authorName: 'text' });

FlowSchema.pre('save', function(next) {
  var self = this;

  self.numMoves = self.moves ? self.moves.length : 0;
  self.length = _.reduce(self.moves, function(sum, move) {
    return sum + move.duration;
  }, 0);

  // Allow setting of difficulty manually?
  var totalDifficulty = _.reduce(self.moves, function(sum, move) {
    return sum + move.difficulty;
  }, 0);
  self.difficulty = self.moves.length ? totalDifficulty / self.moves.length : 0;

  next();
});

FlowSchema.statics = {
  // TODO: Combine load, list, listByUser to be more DRY
  load: function(id, cb) {
    return this.findOne({ _id: id }, '-plays -likers')
      .populate('author', 'name username _id profilePictureUrl')
      .populate('moves.move')
      .exec(cb);
  },

  list: function(options, cb) {
    options = options || {};
    var searchQuery = options.searchQuery || {};

    // Sory by creation time by default
    var sortBy = {};
    sortBy[options.sortBy || 'createdAt'] = -1;

    return this.find(searchQuery, '-moves -plays -likers', options.score)
      .populate('author', 'name username _id profilePictureUrl')
      .sort(sortBy)
      .limit(options.max)
      .skip(options.max * options.page)
      .exec(cb);
  },

  listByUser: function(author_id, options) {
    return this.find({author: author_id}, '-moves -plays -likers')
      .sort({createdAt: -1})
      .limit(options.max)
      .skip(options.max * options.page)
      .exec();
  },

  countByUser: function(author_id) {
    return this.count({author: author_id}).exec();
  },

  recordPlayed: function(id, userId) {
    var update = {
      $inc: {
        playCount: 1
      }
    };

    if (userId) {
      update.$addToSet = {
        plays: userId
      };
    }

    return this.findOneAndUpdate({_id: id}, update, {new: true}).exec();
  }
};

FlowSchema.plugin(likesPlugin, {
  disableDislikes: true,
  likerIdType: ShortId,
  indexed: true
});

FlowSchema.plugin(randomPlugin, { path: '__random'});

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