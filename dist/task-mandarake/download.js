'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadMandarakeImages = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tables = require('../util/tables');

var _files = require('../util/files');

var _download = require('../util/download');

var _name = require('../util/name');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var downloadMandarakeImages = exports.downloadMandarakeImages = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(info, forceName, forceAuthor, subset, dirMin, overwrite) {
    var totalGet, name, baseExt, makeDir, baseName, progress, updateProgress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // If we're downloading multiple images, just print the name of the first one
            // as an example for how the rest will be named.
            totalGet = subset.length ? subset.length : info.imageCount;
            name = forceName || info.title;
            baseExt = (0, _name.getExtAndBase)(info.images[0]).ext;
            makeDir = dirMin !== 0 && dirMin <= totalGet;

            // If there are enough images, we store them in a directory. Create that directory now, if needed.

            baseName = (0, _name.imageName)(name, null, makeDir, false, 1, totalGet, baseExt);

            if (!baseName.dirs.length) {
              _context.next = 8;
              break;
            }

            _context.next = 8;
            return (0, _files.makeDirectory)(baseName.dirs);

          case 8:
            console.log('');
            console.log('Downloading to ' + _chalk2.default.red(baseName.full) + (totalGet > 1 ? ' (' + (subset.length ? 'subset: ' : '') + totalGet + ' image' + (totalGet > 1 ? 's' : '') + (subset.length ? ' of ' + info.imageCount : '') + ')' : '') + '...');
            progress = console.draft((0, _tables.progressBar)(0, totalGet));

            updateProgress = function updateProgress(a, z) {
              return progress((0, _tables.progressBar)(a, z));
            };

            console.log('');

            // Hand info over to the generic file downloader.
            return _context.abrupt('return', (0, _download.downloadAllFiles)(info, info.images, info.imageCount, subset, name, null, makeDir, false, null, updateProgress, overwrite));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function downloadMandarakeImages(_x, _x2, _x3, _x4, _x5, _x6) {
    return _ref.apply(this, arguments);
  };
}();