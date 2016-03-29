'use strict';

exports.defaults = function() {
  return {
    s3Deployer: {
      accessKeyId: '',
      secretAccessKey: '',
      bucket: {
        name: '',
        region: ''
      },
      files: '**/*',
      workingDirectory: 'public'
    }
  };
};

exports.placeholder = function() {
  return [
    '\t',
    '',
    '  # s3Deployer:                       # Configuration for s3-deployer using the --package flag.',
    '    # accessKeyId: \'AKID\'           # S3 access key.',
    '    # secretAccessKey: \'SECRET\'     # S3 secret access key.',
    '    # bucket:                         # Targeted bucket informations.',
    '      # name: \'myBucket\'            # Bucket name.',
    '      # region: \'us-east-1\'         # Bucket region.',
    '',
    '    # files: \'**/*\'                 # glob pattern to match the files to send.',
    '                                      # See https://npmjs.org/package/glob for more information',
    '    # workingDirectory: \'public\'    # Parent directory for the compiled files.'
  ].join('\n');
};

var nonEmptyString = function(errors, fld, str) {
  if (typeof str === 'string' && str.length > 0) {
    return true;
  } else {
    errors.push(fld + ' must be a non empty string');
    return false;
  }
};

exports.validate = function(config, validators) {
  var errors = [];
  var s3Deployer = config.s3Deployer;

  if (validators.ifExistsIsObject(errors, 's3Deployer config', s3Deployer)) {
    nonEmptyString(errors, 's3Deployer.files', s3Deployer.files);
    nonEmptyString(errors, 's3Deployer.workingDirectory', s3Deployer.workingDirectory);
    nonEmptyString(errors, 's3Deployer.accessKeyId', s3Deployer.accessKeyId);
    nonEmptyString(errors, 's3Deployer.secretAccessKey', s3Deployer.secretAccessKey);

    var bucket = s3Deployer.bucket;
    if (validators.ifExistsIsObject(errors, 's3Deployer.bucket', s3Deployer.bucket)) {
      nonEmptyString(errors, 's3Deployer.accessKeyId', s3Deployer.accessKeyId);
    }

    nonEmptyString(errors, 's3Deployer.bucket.name', bucket.name);
    nonEmptyString(errors, 's3Deployer.bucket.region', bucket.region);

  }
  return errors;
};

