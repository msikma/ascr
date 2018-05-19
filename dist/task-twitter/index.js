'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadTwitterURL = exports.fetchTwitterURL = exports.isTwitterURL = exports.tweetCheck = undefined;

var _scrape = require('./scrape');

var _download = require('./download');

var _print = require('./print');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Single tweet URL.
var tweetCheck = exports.tweetCheck = new RegExp('twitter\\.com/([^/]+)/status/([0-9]+)', 'i');

/**
 * Checks whether a URL is for a single tweet.
 */
var isTwitterSingleURL = function isTwitterSingleURL(url) {
  return tweetCheck.test(url);
};

/**
 * Checks whether a URL is any kind of Twitter link we can scrape.
 * Currently only single image links are supported.
 */
var isTwitterURL = exports.isTwitterURL = function isTwitterURL(url) {
  // Currently we only support single work links.
  if (isTwitterSingleURL(url)) {
    return true;
  }
};

/**
 * Parses any Twitter link and returns information about the tweet.
 */
var fetchTwitterURL = exports.fetchTwitterURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    var noThread = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isTwitterSingleURL(url)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', (0, _scrape.fetchTwitterSingle)(url, noThread));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchTwitterURL(_x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Main entry point. Scrapes the Twitter link, then prints its information,
 * then downloads the files.
 *
 * If 'noThread' is true, we'll download images from only the original tweet instead of the author's self-thread.
 */
var downloadTwitterURL = exports.downloadTwitterURL = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, noThread, overwrite) {
    var info;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fetchTwitterURL(url, noThread);

          case 2:
            info = _context2.sent;


            // Print info if not in quiet mode.
            if (!quiet) (0, _print.printTwitterInfo)(info, rawData);

            // If we're only interested in the data, skip downloading the files.

            if (!onlyData) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt('return');

          case 6:
            _context2.next = 8;
            return (0, _download.downloadTwitterImages)(info, name, author, subset, dirMin, authorDir, overwrite);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function downloadTwitterURL(_x3, _x4, _x5, _x6, _x7, _x8, _x9, _x10, _x11, _x12, _x13) {
    return _ref2.apply(this, arguments);
  };
}();