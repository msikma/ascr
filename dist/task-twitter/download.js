'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadTwitterImages = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tables = require('../util/tables');

var _files = require('../util/files');

var _download = require('../util/download');

var _name = require('../util/name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Downloads images scraped from the given Twitter URL.
 * If there are replies by the author with images, these get downloaded as well.
 */
var downloadTwitterImages = exports.downloadTwitterImages = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(tweetsInfo, forceName, forceAuthor, subset, dirMin, authorDir, overwrite) {
    var totalImages, mainTweet, allFiles, total, name, author, firstURL, baseExt, totalDl, makeDir, baseName, progress, updateProgress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            totalImages = tweetsInfo.reduce(function (n, tweet) {
              return n + tweet.images.length;
            }, 0);
            mainTweet = tweetsInfo.filter(function (t) {
              return t.isMainTweet === true;
            })[0];
            allFiles = tweetsInfo.reduce(function (acc, tweet) {
              return [].concat(_toConsumableArray(acc), _toConsumableArray(tweet.images));
            }, []);
            total = totalImages;
            name = forceName || mainTweet.tweet.tweetID;
            author = forceAuthor || mainTweet.author.authorName;
            firstURL = mainTweet.images[0].src[0];
            baseExt = (0, _name.getExtAndBase)(firstURL).ext;
            totalDl = subset.length > 0 ? subset.length : total;
            makeDir = dirMin !== 0 && dirMin <= total;

            // If there are enough images, we store them in a directory. Create that directory now, if needed.

            baseName = (0, _name.imageName)(name, author, makeDir, authorDir, 1, total, baseExt);

            if (!baseName.dirs.length) {
              _context.next = 14;
              break;
            }

            _context.next = 14;
            return (0, _files.makeDirectory)(baseName.dirs);

          case 14:

            console.log('');
            console.log('Downloading to ' + _chalk2.default.red(baseName.full) + (total > 1 ? ' (' + (subset.length > 0 ? 'subset: ' : '') + totalDl + ' image' + (totalDl > 1 ? 's' : '') + ')' : '') + '...');
            progress = console.draft((0, _tables.progressBar)(0, total));

            updateProgress = function updateProgress(a, z) {
              return progress((0, _tables.progressBar)(a, z));
            };

            // Hand info over to the generic file downloader.


            return _context.abrupt('return', (0, _download.downloadAllFiles)(tweetsInfo, allFiles, total, subset, name, author, makeDir, authorDir, null, updateProgress, overwrite));

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function downloadTwitterImages(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref.apply(this, arguments);
  };
}();