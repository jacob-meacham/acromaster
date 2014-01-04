'use strict';

require('../models/flow.js');
require('../models/move.js');

//var s3 = require('s3');
var mongoose = require('mongoose');
//var async = require('async');

var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var moves = [
  {
    name: 'Barrel Roll',
    audioUri: '/audio/acro_-01.wav',
    tags: 'washing_machine,simple'
  },
  {
    name: 'Seattle Barrel Roll',
    audioUri: '/audio/acro_-03.wav',
    tags: 'washing_machine,simple'
  },
  {
    name: 'High Foot to Hand',
    audioUri: '/audio/acro_-02.wav',
  },
  {
    name: 'Mayurasana',
    audioUri: '/audio/acro_-04.wav',
  },
  {
    name: 'Secretary',
    audioUri: '/audio/acro_-05.wav',
  }
];

var config = require('../../config/config').development;
/*
var s3Client = s3.createClient({
  key: '123',
  secret: 'abc',
  bucket: 'moves',
  endpoint: 'localhost',
  port: 10001
});
*/

/*
async.each(moves,
  function(item, callback) {
    var uploader = s3Client.upload(item.file, item.path);
    uploader.on('error', function(err) {
      callback(err);
    });
    uploader.on('progress', function(amountDone, amountTotal) {
      console.log('progress', amountDone, amountTotal);
    });
    uploader.on('end', function() {
      callback(null);
    });
  },
  function(err) {
    console.log('error uploading files to s3: ' + err);
  });
*/

mongoose.connect(config.db, function(err) {
  if (err) {
    console.log('Error connecting to db: ' + err);
  }
});

Move.remove().exec()
.then(function() { return Flow.remove().exec(); })

// Update
.then(function() { return Move.create(moves); })
.then(function() { process.exit(); }, function(err) { console.log('Error seeding database: ' + err); process.exit(1); });
