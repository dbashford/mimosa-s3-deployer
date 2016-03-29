var registration = function() {};

var config    = require('./config'),
    glob      = require('glob'),
    logmimosa = require('logmimosa'),
    fs        = require('fs'),
    mime      = require('mime'),
    AWS       = require('aws-sdk'),
    async     = require('async'),
    path      = require('path'),
    s3;

var FILE_CREATED        = 1,
    FILE_NOT_MODIFIED   = 2,
    FILE_IS_A_DIRECTORY = 3,
    FILE_UPDATED        = 4;

var _send = function(req, status, fn) {
  var path = req.path,
      key  = req.key;

  fs.readFile(path, function(err, buf) {
    if (err) {
      fn(err);
    } else {
      var type = mime.lookup(path);

      var info = {
        //Bucket          : bucket,
        Key             : key,
        Body            : buf,
        ACL             : 'public-read',
        ContentType     : type
      };

      s3.putObject(info, function(err) {
        fn(err, status);
      });
    }
  });
};

var send = function(req, fn) {
  var key  = req.key,
      path = req.path;

  fs.stat(path, function(err, stat) {
    if (err) {
      fn(err);
    } else if (!stat.isDirectory()) {

      s3.headObject({
        Key: key
      }, function(err, data) {
        if (err && err.statusCode === 404) {
          _send(req, FILE_CREATED, fn);
        } else {
          if (stat.ctime >= new Date(data.LastModified)) {
            _send(req, FILE_UPDATED, fn);
          } else {
            _send(req, FILE_NOT_MODIFIED, fn);
          }
        }
      });
    } else {
      fn(null, FILE_IS_A_DIRECTORY);
    }
  });
};


var sendQueue = async.queue(send, 10);

var deploy = function(config) {
  var s3Deployer = config.s3Deployer,
      publicDirectory = path.join(config.root, s3Deployer.workingDirectory),
      region = s3Deployer.bucket.region,
      bucket = s3Deployer.bucket.name;

  s3 = new AWS.S3({
    accessKeyId     : s3Deployer.accessKeyId,
    secretAccessKey : s3Deployer.secretAccessKey,
    region          : region,
    params          : {
      Bucket: bucket
    }
  });

  glob(
    s3Deployer.files,
    {
      cwd: publicDirectory
    },
    function(err, files) {
      if (err) {
        logmimosa.error(err);
        return;
      } else {
        files.forEach(function(file) {
          var pathname = path.join(publicDirectory, file);
          sendQueue.push({ path: pathname, key: file}, function(err, status) {
            if (err) {
              logmimosa.error(err);
            } else {
              switch(status) {
                case FILE_CREATED:
                  logmimosa.success('CREATE https://s3-' + region + '.amazonaws.com/' + bucket + '/' + file);
                  break;
                case FILE_UPDATED:
                  logmimosa.success('UPDATE https://s3-' + region + '.amazonaws.com/' + bucket + '/' + file);
                  break;
                case FILE_NOT_MODIFIED:
                  logmimosa.success('NOT MODIFIED https://s3-' + region + '.amazonaws.com/' + bucket + '/' + file);
                  break;
              }
            }
          });
        });
      }
    });
};

var registerCommand = function(program, logger, retrieveConfig) {
  program.command('deploy').description('deploy your assets to AWS S3').action(function() {
    retrieveConfig({
      buildFirst: false
    }, deploy);
  });
};

module.exports = {
  registration    : registration,
  registerCommand : registerCommand,
  defaults        : config.defaults,
  placeholder     : config.placeholder,
  validate        : config.validate
};

