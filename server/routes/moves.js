'use strict';

var Move = require('../models/move');

var getMoves = function(req, res, next) {
  var query = req.query;
  Move.find(query, function(err, moves) {
    if (err) {
      return next(err);
    }

    res.jsonp(moves);
  });
};

module.exports = function(app) {
  app.get('/api/moves', getMoves);
};
