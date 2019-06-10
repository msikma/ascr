'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadAllFiles = exports.warnIfExists = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _cookies = require('./cookies');

var _cookies2 = _interopRequireDefault(_cookies);

var _request = require('./request');

var _name = require('./name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Prints a warning if a file already exists.
var warnIfExists = exports.warnIfExists = function warnIfExists(path) {
  var overwrite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (_fs2.default.existsSync(path.full)) {
    console.log('Warning: file ' + _chalk2.default.red(path.fn) + ' exists. ' + (overwrite ? 'Overwriting.' : 'Adjusting filename.'));
  }
};

/**
 * Downloads a series of files. This is performed after all preparations have been completed and all we need
 * to do is pull in the files from the work.
 *
 * Returns a promise that resolves after all files are downloaded (or skipped, if they aren't in the subset).
 */
var downloadAllFiles = exports.downloadAllFiles = function downloadAllFiles(info, files, total, subset, name, author, makeDir, authorDir, makeHeaders, updateProgress) {
  var overwrite = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : false;

  var downloaded = 0;
  var counter = 0;
  var totalDl = subset.length > 0 ? subset.length : total;

  return Promise.all(files.map(function (image, n) {
    // Exit immediately if we're downloading a subset of images, and this one isn't in it.
    if (subset.length && subset.indexOf(n + 1) === -1) {
      return updateProgress(++counter, total);
    }
    // Otherwise, download as usual.
    var url = image.src ? image.src[0] : image;

    // Some downloads might have a different author for a specific image in the list.
    // E.g. Tumblr posts that have downloadable replies from other people.
    var currAuthor = image.author;
    var headers = makeHeaders ? makeHeaders(image.src[1]) : {};
    var ext = (0, _name.getExtAndBase)(url).ext;
    var path = (0, _name.imageName)(name, currAuthor || author, makeDir, authorDir, ++downloaded, totalDl, ext);
    warnIfExists(path, overwrite);

    return new Promise(function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve) {
        var fullPath, mightBeURL, mightBeName;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // If we're not overwriting existing files, run avoidDuplicates() to ensure the filename is unique.
                fullPath = overwrite ? path.full : (0, _name.avoidDuplicates)(path.full);
                // Our really big Pixiv hack.

                mightBeURL = image.srcMightBe ? image.srcMightBe[0] : null;
                mightBeName = mightBeURL ? overwrite ? (0, _name.swapExt)(path.full) : (0, _name.avoidDuplicates)((0, _name.swapExt)(path.full)) : null;
                _context.next = 5;
                return (0, _request.downloadFileAsBrowser)(url, fullPath, _cookies2.default.jar, headers, true, {}, mightBeURL, mightBeName);

              case 5:
                updateProgress(++counter, total);
                resolve(fullPath);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x3) {
        return _ref.apply(this, arguments);
      };
    }());
  }));
};