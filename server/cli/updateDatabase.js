'use strict';

require('../models/flow.js');
require('../models/move.js');

var cli = require('commander');
var s3 = require('s3');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var path = require('path');

var Move = mongoose.model('Move');

cli.version('1.0.0')
  .usage('[options] <Definition File> <Audio Dir>')
  .option('-S, --no-s3', 'Don\'t upload data to S3')
  .option('-x, --overwrite', 'Overwrite the current moves in the db with new ones.')
  .option('-e, --environment [env]', 'Specify which environment to pull from. [development]', 'development')
  .option('-v, --verbose', 'Enable verbose logging')
  .parse(process.argv);

if (cli.args.length !== 2) {
  cli.help();
}

var config = require('../config/config')[cli.environment];
var bucket = 'acromaster';
var s3Client = s3.createClient({
  s3Options: {
    accessKeyId: config.s3.key,
    secretAccessKey: config.s3.secret,
    endpoint: config.s3.url,
    sslEnabled: false,
    s3ForcePathStyle: true
  }
});

// Read the passed json file and turn into a list of moves
var readMovesFile = function(callback) {
  fs.readFile(cli.args[0], function(err, data) {
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
  if (!cli.s3) {
    return callback(null);
  }

  var audioDir = cli.args[1];
  if (cli.verbose) {
    console.log('Uploading files from ' + audioDir + ' to ' + config.s3.url);
  }

  async.each(results.read_file,
    function(item, each_callback) {
      setTimeout(function() {
        var audioFile = path.resolve(path.join(audioDir, item.audioUri));
        
        var uploader = s3Client.uploadFile({localFile: audioFile, s3Params: {Bucket: bucket, Key: 'audio/' + item.audioUri}});
        uploader.on('error', function(err) {
          console.log('error uploading ' + item.audioUri + '(' + err + ')');
        });

        uploader.on('end', function() {
          if (cli.verbose) {
            console.log('Successfully uploaded ' + item.audioUri);
          }
          each_callback(null);
        });
      }, Math.random() * 1000); // Otherwise S3 can get upset.
    },
    
    function(err) {
      if (err) {
        callback(err);
      } else {
        if (cli.verbose) {
          console.log('All moves uploaded to S3 successfully.');
        }
        callback(null);
      }
    }
  );
};

// Write moves to mongo
var writeToDb = function(callback, results) {
  if (cli.verbose) {
    console.log('Writing moves to ' + config.dbUrl);
  }

  mongoose.connect(config.dbUrl, function(err) {
    if (err) {
      callback(err);
    }

    var moves = results.read_file;
    async.each(moves,
      function(move, each_callback) {
        move.audioUri = 'http://' + config.s3.url + '/' + move.audioUri;
        if (cli.overwrite) {
          var newMove = new Move(move);
          if (cli.verbose) {
            console.log('Creating move ' + newMove.name + ' = ' + JSON.stringify(newMove));
          }
          newMove.save(each_callback);
        } else {
          if (cli.verbose) {
            console.log('Updating ' + move.name + ' to ' + JSON.stringify(move));
            console.log('');
          }
          Move.update({ name: move.name }, move, { upsert: true }, each_callback);
        }
      },
      function(err) {
        if (err) {
          callback(err);
        } else {
          if (cli.verbose) {
            console.log('Moves inserted into DB successfully.');
          }
          callback(null);
        }
    });
  });
};

async.auto({
  read_file: readMovesFile,
  write_to_s3: ['read_file', writeAudioToS3],
  write_to_db: ['read_file', 'write_to_s3', writeToDb]
  },
  function done(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      process.exit(0);
    }
});