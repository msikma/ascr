'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadGenericImages = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tables = require('../util/tables');

var _files = require('../util/files');

var _download = require('../util/download');

var _name = require('../util/name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var downloadGenericImages = exports.downloadGenericImages = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(info, forceName, forceAuthor, subset, dirMin, authorDir, overwrite) {
    var images, totalGet, name, author, firstURL, baseExt, makeDir, baseName, progress, updateProgress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            images = info.images;
            totalGet = subset.length ? subset.length : images.length;
            name = forceName || info.title ? info.title + ' (' + info.page + ')' : info.page;
            author = forceAuthor || info.domain;
            firstURL = images[0].src[0];
            baseExt = (0, _name.getExtAndBase)(firstURL).ext;
            makeDir = dirMin !== 0 && dirMin <= totalGet;

            // If there are enough images, we store them in a directory. Create that directory now, if needed.

            baseName = (0, _name.imageName)(name, author, makeDir, authorDir, 1, totalGet, baseExt);

            if (!baseName.dirs.length) {
              _context.next = 11;
              break;
            }

            _context.next = 11;
            return (0, _files.makeDirectory)(baseName.dirs);

          case 11:

            console.log('');
            console.log('Downloading to ' + _chalk2.default.red(baseName.full) + (totalGet > 1 ? ' (' + (subset.length > 0 ? 'subset: ' : '') + totalGet + ' image' + (totalGet > 1 ? 's' : '') + (subset.length ? ' of ' + info.imageCount : '') + ')' : '') + '...');
            progress = console.draft((0, _tables.progressBar)(0, totalGet));

            updateProgress = function updateProgress(a, z) {
              return progress((0, _tables.progressBar)(a, z));
            };

            // Hand info over to the generic file downloader.


            return _context.abrupt('return', (0, _download.downloadAllFiles)(null, images, totalGet, subset, name, author, makeDir, authorDir, null, updateProgress, overwrite));

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function downloadGenericImages(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref.apply(this, arguments);
  };
}();