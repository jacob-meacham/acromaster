var movelist = require('../models/movelist.js');
var moves = require('../models/move.js');

show = function(req, res) {
  res.jsonp(req.moveList);
};

module.exports = function(app) {
  app.get('/moves/:moveListId', show);
};