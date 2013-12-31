render = function(req, res) {
    res.render('index');
};

module.exports = function(app) {
  app.get('/', render);
};