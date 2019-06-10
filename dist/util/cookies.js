'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCookies = undefined;

var _toughCookieFileStoreSync = require('tough-cookie-file-store-sync');

var _toughCookieFileStoreSync2 = _interopRequireDefault(_toughCookieFileStoreSync);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Keep our cookies globally available.
var cookieJar = {
  jar: null

  /**
   * Loads cookies from a specified cookies.txt file and loads them into
   * a jar so that we can make requests with them.
   */
};var loadCookieFile = function loadCookieFile(cookieFile) {
  return new Promise(function (resolve, reject) {
    try {
      // Cookies exported from the browser in Netscape cookie file format.
      // These are sent with our request to ensure we have access to logged in pages.
      var cookieStore = new _toughCookieFileStoreSync2.default(cookieFile, { no_file_error: true });
      var jar = _request2.default.jar(cookieStore);
      resolve(jar);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Loads cookies from the specified cookies.txt file (or the default file)
 * and loads them into a jar so that we can make requests with them.
 *
 * Cookies must be exported from the browser in Netscape cookie file format.
 * Without cookies, all requests will be logged out. This particularly affects Pixiv.
 */
var loadCookies = exports.loadCookies = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file) {
    var newJar;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (file) {
              _context.next = 3;
              break;
            }

            cookieJar.jar = null;
            return _context.abrupt('return');

          case 3:
            _context.next = 5;
            return loadCookieFile(file);

          case 5:
            newJar = _context.sent;

            cookieJar.jar = newJar;

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function loadCookies(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = cookieJar;