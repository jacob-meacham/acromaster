'use strict';

var index = function(req, res) {
    res.render('index', {
      user: req.user ? req.user : {}
    });
};

module.exports = function(app) {
  app.get('/', index);

  // Wildcard catchall
  app.get('*', index);
};