'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
  name: String,
  moves: [{
    move: { type: Schema.Types.ObjectId, ref: 'Move' },
    duration: Number
  }],
  duration: Number
});

FlowSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('Flow', FlowSchema);