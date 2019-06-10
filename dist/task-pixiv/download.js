'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadPixivImages = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                   * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                   */

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _animation = require('./animation');

var _tables = require('../util/tables');

var _files = require('../util/files');

var _download = require('../util/download');

var _name = require('../util/name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Returns the headers necessary to scrape images from multi-image Pixiv works.
 * Requires a referrer URL to be set.
 */
var pixivHeaders = function pixivHeaders(referrer) {
  return _extends({
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Cache-Control': 'no-cache',
    'Authority': 'i.pximg.net'
  }, referrer ? { 'Referer': referrer } : {});
};

/**
 * Scrapes Pixiv images from an info object - this is data returned from e.g. fetchPixivSingle().
 * It's important that we send an appropriate 'Referer' header when grabbing these images,
 * or Pixiv will show a 403 forbidden.
 */
var downloadPixivImages = exports.downloadPixivImages = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(info, forceName, forceAuthor, subset, dirMin, authorDir, type, overwrite) {
    var totalGet, name, author, baseExt, makeDir, baseName, makeAnimation, progress, updateProgress, files;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // If we're downloading multiple images, just print the name of the first one
            // as an example for how the rest will be named.
            totalGet = subset.length ? subset.length : info.imageCount;
            name = forceName || info.title;
            author = forceAuthor || info.author.authorName;
            baseExt = (0, _name.getExtAndBase)(info.images[0].src[0]).ext;
            makeDir = dirMin !== 0 && dirMin <= totalGet;

            // If there are enough images, we store them in a directory. Create that directory now, if needed.

            baseName = (0, _name.imageName)(name, author, makeDir, authorDir, 1, totalGet, baseExt);

            if (!baseName.dirs.length) {
              _context.next = 9;
              break;
            }

            _context.next = 9;
            return (0, _files.makeDirectory)(baseName.dirs);

          case 9:
            // If we're downloading an animation, we'll either save it to .zip or make a .gif/.webm.
            // In all other cases, we just keep the same extension. Determine which one it is here.
            makeAnimation = info.isAnimation && baseExt === 'zip' && type !== 'none';

            console.log('');
            console.log('Downloading to ' + _chalk2.default.red(baseName.full) + (totalGet > 1 ? ' (' + (subset.length ? 'subset: ' : '') + totalGet + ' image' + (totalGet > 1 ? 's' : '') + (subset.length ? ' of ' + info.imageCount : '') + ')' : '') + '...');
            progress = console.draft((0, _tables.progressBar)(0, totalGet));

            updateProgress = function updateProgress(a, z) {
              return progress((0, _tables.progressBar)(a, z));
            };

            console.log('');

            // Hand info over to the generic file downloader.
            _context.next = 17;
            return (0, _download.downloadAllFiles)(info, info.images, info.imageCount, subset, name, author, makeDir, authorDir, pixivHeaders, updateProgress, overwrite);

          case 17:
            files = _context.sent;

            if (!makeAnimation) {
              _context.next = 20;
              break;
            }

            return _context.abrupt('return', (0, _animation.convertToAnimation)(files, info.images, type));

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function downloadPixivImages(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
    return _ref.apply(this, arguments);
  };
}();