'use strict';

var Move = require('../models/move.js');

var getMoves = function(req, res, next) {
  // TODO: Don't allow arbitrary input
  var query = {};
  if (req.query !== null) {
    query = req.query;
  }
  
  Move.find(query, function(err, moves) {
    console.log('returning moves: ' + moves);
    if (err) {
      return next(err);
    }

    res.jsonp(moves);
  });
};

module.exports = function(app) {
  app.get('/api/moves', getMoves);
};
