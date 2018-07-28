'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadTumblrURL = exports.fetchTumblrURL = exports.isTumblrURL = exports.tumblrPostCheck = undefined;

var _scrape = require('./scrape');

var _download = require('./download');

var _print = require('./print');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Single Tumblr post.
var tumblrPostCheck = exports.tumblrPostCheck = new RegExp('([^\\.]+)\\.tumblr\\.com/post/([0-9]+)(/([^/]+))?', 'i');

/**
 * Checks whether a URL is for a single Tumblr post.
 */
var isTumblrSingleURL = function isTumblrSingleURL(url) {
  return tumblrPostCheck.test(url);
};

/**
 * Checks whether a URL is any kind of Tumblr link we can scrape.
 * Currently only single image links are supported.
 */
var isTumblrURL = exports.isTumblrURL = function isTumblrURL(url) {
  // Currently we only support single work links.
  if (isTumblrSingleURL(url)) {
    return true;
  }
};

/**
 * Parses any Tumblr link and returns information about the post.
 */
var fetchTumblrURL = exports.fetchTumblrURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, tumblrJSON, isDefault) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isTumblrSingleURL(url)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', (0, _scrape.fetchTumblrSingle)(url, tumblrJSON, isDefault));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchTumblrURL(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Main entry point. Scrapes the Tumblr link, then prints its information,
 * then downloads the files.
 */
var downloadTumblrURL = exports.downloadTumblrURL = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite, tumblrJSON, tumblrJSONIsDefault) {
    var info;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fetchTumblrURL(url, tumblrJSON, tumblrJSONIsDefault);

          case 2:
            info = _context2.sent;


            // Print info if not in quiet mode.
            if (!quiet) (0, _print.printTumblrInfo)(info, rawData);

            // If we're only interested in the data, skip downloading the files.

            if (!onlyData) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt('return');

          case 6:
            _context2.next = 8;
            return (0, _download.downloadTumblrImages)(info, name, author, subset, dirMin, authorDir, overwrite);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function downloadTumblrURL(_x4, _x5, _x6, _x7, _x8, _x9, _x10, _x11, _x12, _x13, _x14, _x15, _x16) {
    return _ref2.apply(this, arguments);
  };
}();