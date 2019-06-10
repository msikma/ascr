'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadUnknownURL = undefined;

var _scrape = require('./scrape');

var _download = require('./download');

var _print = require('./print');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var downloadUnknownURL = exports.downloadUnknownURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, overwrite) {
    var info;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _scrape.fetchGenericURL)(url);

          case 2:
            info = _context.sent;

            if (!(info.imageCount === 0)) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return', false);

          case 5:

            // Print info if not in quiet mode.
            if (!quiet) (0, _print.printGenericInfo)(info, rawData);

            // If we're only interested in the data, skip downloading the files.

            if (!onlyData) {
              _context.next = 8;
              break;
            }

            return _context.abrupt('return');

          case 8:
            _context.next = 10;
            return (0, _download.downloadGenericImages)(info, name, author, subset, dirMin, authorDir, overwrite);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function downloadUnknownURL(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8, _x9, _x10) {
    return _ref.apply(this, arguments);
  };
}();