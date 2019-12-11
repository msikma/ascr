'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moveFile = exports.unlinkFile = exports.unzipFile = exports.readFile = exports.writeFile = exports.makeDirectory = exports.safePath = exports.copyFile = undefined;

var _moveFile = require('move-file');

Object.defineProperty(exports, 'moveFile', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_moveFile).default;
  }
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _unzipper = require('unzipper');

var _unzipper2 = _interopRequireDefault(_unzipper);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _isArray = require('./isArray');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copies a file from one location to another. Uses a promise.
 */
var copyFile = exports.copyFile = function copyFile(src, dest) {
  return new Promise(function (resolve) {
    var rd = _fs2.default.createReadStream(src);
    var wr = _fs2.default.createWriteStream(dest);
    wr.on('close', function () {
      return resolve();
    });
    rd.pipe(wr);
  });
};

/**
 * Replaces unsafe filename characters with dashes.
 * Paths with e.g. slashes or colons in them can cause problems.
 */
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

var safePath = exports.safePath = function safePath(dirsArray) {
  return dirsArray.map(function (d) {
    return (0, _sanitizeFilename2.default)(String(d), { replacement: '-' });
  });
};

/**
 * Makes a directory. Returns a promise that resolves once the directory has been made.
 */
var makeDirectory = exports.makeDirectory = function makeDirectory(dirs) {
  return new Promise(function (resolve, reject) {
    // Wrap in an array if it isn't already.
    var dirsArray = (0, _isArray.isArray)(dirs) ? dirs : dirs.split('/');
    var path = safePath(dirsArray).join('/');
    (0, _mkdirp2.default)(path, function (err) {
      return err ? reject() : resolve(path);
    });
  });
};

/**
 * Saves a file to a specific path. Uses a promise.
 */
var writeFile = exports.writeFile = function writeFile(path, content) {
  return new Promise(function (resolve, reject) {
    _fs2.default.writeFile(path, content, 'utf8', function (err) {
      if (err) reject(err);else resolve();
    });
  });
};

/**
 * Reads a file from a path. Uses a promise.
 */
var readFile = exports.readFile = function readFile(path) {
  var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';
  return new Promise(function (resolve, reject) {
    _fs2.default.readFile(path, encoding, function (err, data) {
      if (err) reject(err);else resolve(data);
    });
  });
};

/**
 * Unzips a file to a destination directory. Uses a promise.
 */
var unzipFile = exports.unzipFile = function unzipFile(src, dest) {
  return new Promise(function (resolve) {
    _fs2.default.createReadStream(src).pipe(_unzipper2.default.Extract({ path: dest })).on('close', function () {
      resolve();
    });
  });
};

/**
 * Unlinks a file. Uses a promise.
 */
var unlinkFile = exports.unlinkFile = function unlinkFile(path) {
  return new Promise(function (resolve, reject) {
    _fs2.default.unlink(path, function (err) {
      return err ? reject(err) : resolve();
    });
  });
};

// Steal moveFile from npm.