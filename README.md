mimosa-s3-deployer
===========

## Overview

Deploy your static files to AWS S3.
For more information regarding Mimosa, see http://mimosa.io/

## Install

```
mimosa mod:install mimosa-s3-deployer
```

## Usage

Run `mimosa deploy` to deploy your files.

## Functionality


## Default Config

```coffee
s3Deployer:                    # Configuration for s3-deployer using the --package flag.
  accessKeyId: ''              # S3 access key
  secretAccessKey: ''          # S3 secret access key.
  bucket:                      # Targeted bucket informations.
    name: ''                   # Bucket name.
    region: ''                 # Bucket region.
  files: '**/*'                # glob pattern to match the files to send.
                               # See https://npmjs.org/package/glob for more information
  workingDirectory: 'public'   # Parent directory for the compiled files.
```

## Example Config

```coffee
s3Deployer:
  accessKeyId: '123456'
  secretAccessKey: 'abcdef'
  bucket:
    name: 'myBucket'
    region: 'us-east-1'
  files: '{' + [
    'images/**/*',
    'stylesheets/style.css',
    'javascripts/vendor/ember.min.js',
    'javascripts/vendor/handlebars.runtime.js',
    'javascripts/main-built.js'
  ].join(',') + '}'

```
