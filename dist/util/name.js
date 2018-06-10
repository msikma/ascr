'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avoidDuplicates = exports.getExtAndBase = exports.imageName = exports.swapExt = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _files = require('./files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                     * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                     */

var nameSeparator = ' - ';
var azSeparator = '-';

/**
 * When downloading multiple images from Pixiv, the largest size image might be
 * a JPG or it might be a PNG. The cheapest strategy is to try and download
 * the JPG first, and if it's a 404, download the PNG.
 */
var swapExt = exports.swapExt = function swapExt(url) {
  var eb = getExtAndBase(url);
  if (eb.ext === 'jpg' || eb.ext === 'jpeg') {
    return eb.fn + '.png';
  } else {
    return eb.fn + '.jpg';
  }
};

/**
 * Returns a filename and directory name suggestion for files we download.
 * 'a' is the serial number for this image, and 'z' is the total number of images.
 * 'ext' is the file extension (e.g. 'jpg' or 'png'), without a period.
 *
 * This function returns an object containing a 'dirs' array and 'file' string.
 */
var imageName = exports.imageName = function imageName(name, author, makeDir, authorDir) {
  var a = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var z = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
  var ext = arguments[6];

  var file = [].concat(_toConsumableArray(z === 1 && makeDir ? ['image'] : []), _toConsumableArray(z > 1 ? [' ' + a + azSeparator + z] : []), [
  // The file extension.
  '.' + ext]);

  // We'll use the base either for the directory name, or for the filename
  // depending on whether we're putting the files in a directory or not.
  if (makeDir && authorDir) {
    var dirs = (0, _files.safePath)([author, name]);
    var fn = file.join('').trim();
    return { dirs: dirs, fn: fn, full: dirs.join('/') + '/' + fn };
  } else if (makeDir && !authorDir) {
    var _dirs = (0, _files.safePath)([[name, author].join(nameSeparator).trim()]);
    var _fn = file.join('').trim();
    return { dirs: _dirs, fn: _fn, full: _dirs[0] + '/' + _fn };
  } else {
    var _fn2 = [(0, _files.safePath)([name, author]).join(nameSeparator)].concat(_toConsumableArray(file)).join('').trim();
    return { dirs: [], fn: _fn2, full: _fn2 };
  }
};

/**
 * Splits a string by a separator, but only by the last occurrence of the separator.
 * The separators are kept. e.g. './.hidden/.dir/myfile.jpg' becomes ['./.hidden/.dir/myfile', '.jpg']
 */
var splitOnLast = function splitOnLast(str, sep) {
  var segments = str.split(sep);
  if (segments.length === 1) return segments;
  var start = segments.slice(0, segments.length - 1);
  var end = segments.slice(-1);
  return ['' + start.join('.'), '' + sep + end[0]];
};

/**
 * Retrieves the base path and extension of a filename. Removes :large, :orig, etc. on Twitter URLs if found.
 */
var getExtAndBase = exports.getExtAndBase = function getExtAndBase(path) {
  var split = splitOnLast(path, '.');
  return { ext: split.pop().split(':').shift().slice(1), fn: split.shift() };
};

/**
 * Checks to see if this filename already exists. If so, it recommends a different filename.
 */
var avoidDuplicates = exports.avoidDuplicates = function avoidDuplicates(filename) {
  var extBase = getExtAndBase(filename);
  var tries = 1;
  var newName = filename;
  while (true) {
    // Break if no file by that name can be found, meaning we can use it.
    if (!_fs2.default.existsSync(newName)) break;
    // Just to ensure we don't get stuck.
    if (++tries > 2000) break;

    // Add '2', '3', etc. after the base.
    newName = extBase.fn + ' ' + tries + '.' + extBase.ext;
  }
  return newName;
};