var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MoveListSchema = new Schema({
  name: String,
  moves: [{
    move: { type: Schema.Types.ObjectId, ref: 'Move' },
    duration: Number
  }],
  duration: Number
});

MoveListSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('MoveList', MoveListSchema);