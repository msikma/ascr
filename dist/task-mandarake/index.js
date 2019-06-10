'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadMandarakeURL = exports.fetchMandarakeURL = exports.isMandarakeURL = undefined;

var _scrape = require('./scrape');

var _print = require('./print');

var _download = require('./download');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Checks whether a URL is for an auction page.
 */
var isMandarakeAuctionURL = function isMandarakeAuctionURL(url) {
  return (/\/\/ekizo\.mandarake\.co\.jp\/auction\/item\/itemInfo.+?index=[0-9]+$/.test(url)
  );
};

/**
 * Checks whether a URL is any kind of Mandarake link we can scrape.
 * Currently only auction links are supported.
 */
var isMandarakeURL = exports.isMandarakeURL = function isMandarakeURL(url) {
  if (isMandarakeAuctionURL(url)) {
    return true;
  }
};

/**
 * Parses any Pixiv link and returns information about the work.
 */
var fetchMandarakeURL = exports.fetchMandarakeURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isMandarakeAuctionURL(url)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', (0, _scrape.fetchEkizoSingle)(url));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchMandarakeURL(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Main entry point. Scrapes the Pixiv link, then prints its information,
 * then downloads the files.
 */
var downloadMandarakeURL = exports.downloadMandarakeURL = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, name, author, subset, dirMin, authorDir, rawData, onlyData, type, quiet, overwrite) {
    var info;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fetchMandarakeURL(url);

          case 2:
            info = _context2.sent;


            // Print info if not in quiet mode.
            if (!quiet) (0, _print.printMandarakeInfo)(info, rawData);

            // If we're only interested in the data, skip downloading the files.

            if (!onlyData) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt('return');

          case 6:
            _context2.next = 8;
            return (0, _download.downloadMandarakeImages)(info, name, author, subset, dirMin, overwrite);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function downloadMandarakeURL(_x2, _x3, _x4, _x5, _x6, _x7, _x8, _x9, _x10, _x11, _x12) {
    return _ref2.apply(this, arguments);
  };
}();