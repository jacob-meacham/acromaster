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

mongoose.model('MoveList', MoveListSchema);