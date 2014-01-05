'use strict';

require('../models/flow.js');
require('../models/move.js');

var s3 = require('s3');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var path = require('path');

var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

// get list of moves and local audio directory from command line
var args = process.argv.splice(2);
var audioDir = args[1];

var config = require('../../config/config').development;
var s3Client = s3.createClient({
  key: config.s3.key,
  secret: config.s3.secret,
  bucket: 'moves',
  endpoint: config.s3Url,
  port: config.s3Port,
  style: 'path'
});

// Read the passed json file and turn into a list of moves
var readMovesFile = function(callback) {
  fs.readFile(args[0], function(err, data) {
    if (err) {
      console.log('Error reading move data: ' + err);
      callback(err, null);
    }

    var moves = JSON.parse(data);
    callback(null, moves);
  });
};

// Write audio files to s3, from config
var writeAudioToS3 = function(callback, results) {
  async.each(results.read_file,
    function(item, each_callback) {
      var audioFile = path.resolve(path.join(audioDir, item.audioUri));
      console.log(audioFile);
      
      var uploader = s3Client.upload(audioFile, 'audio/' + item.audioUri);
      uploader.on('error', function(err) {
        console.log('error uploading ' + item.audioUri + '(' + err + ')');
      });

      uploader.on('end', function() {
        console.log('Successfully uploaded ' + item.audioUri);
        each_callback(null);
      });
    },
    
    function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  );
};

// Write moves to mongo
var writeToMongo = function(callback, results) {
  mongoose.connect(config.db, function(err) {
    if (err) {
      callback(err);
    }

    // Remove
    Move.remove().exec()
    .then(function() { return Flow.remove().exec(); })

    // Update
    .then(function() { return Move.create(results.read_file); })
    .then(function() { callback(null); }, function(err) { callback(err); });
  });
};

async.auto({
  read_file: readMovesFile,
  write_to_s3: ['read_file', writeAudioToS3],
  write_to_mongo: ['read_file', writeToMongo]
  },
  function done(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      process.exit(0);
    }
});