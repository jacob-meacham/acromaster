'use strict';

require('../models/flow.js');
require('../models/move.js');

var s3 = require('s3');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var path = require('path');

//var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

// get list of moves and local audio directory from command line
var args = process.argv.splice(2);
var audioDir = args[1];

var config = require('../config/config').production;
var bucket = 'acromaster';
var s3Client = s3.createClient({
  key: config.s3.key,
  secret: config.s3.secret,
  bucket: bucket,
  endpoint: config.s3.url,
  port: config.s3.port,
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
      setTimeout(function() {
        var audioFile = path.resolve(path.join(audioDir, item.audioUri));
        
        var uploader = s3Client.upload(audioFile, 'audio/' + item.audioUri);
        uploader.on('error', function(err) {
          console.log('error uploading ' + item.audioUri + '(' + err + ')');
        });

        uploader.on('end', function() {
          console.log('Successfully uploaded ' + item.audioUri);

          // Also fix the URI to point to where we actually uploaded it:
          item.audioUri = 'http://' + config.s3.url + ':' + config.s3.port + '/' + bucket + '/audio/' + item.audioUri;

          each_callback(null);
        });
      }, Math.random() * 1000);
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
  mongoose.connect(config.dbUrl, function(err) {
    if (err) {
      callback(err);
    }

    // Remove
    //Move.remove().exec()
    //.then(function() { return Flow.remove().exec(); })
    var errorHandler = function(err) {
      if (err) callback(err);
    };

    var moves = results.read_file;
    for (var i = 0; i < moves.length; i++) {
      var move = moves[i];
      Move.update({ name: move.name }, move, { upsert: true }, errorHandler);
    }

    callback(null);
  });
};

async.auto({
  read_file: readMovesFile,
  //write_to_s3: ['read_file', writeAudioToS3],
  write_to_mongo: ['read_file', /*'write_to_s3',*/ writeToMongo]
  },
  function done(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      process.exit(0);
    }
});