/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore');

module.exports = function (app) {
    app.get('/', function (req, res, next) {
      res.json(['INDEX 2']);
    });
};