'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCookies = undefined;

var _requestAsBrowser = require('requestAsBrowser');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Keep our cookies globally available.
var cookieJar = {
  jar: null

  /**
   * Loads cookies from the specified cookies.txt file (or the default file)
   * and loads them into a jar so that we can make requests with them.
   *
   * Cookies must be exported from the browser in Netscape cookie file format.
   * Without cookies, all requests will be logged out. This particularly affects Pixiv.
   */
};var loadCookies = exports.loadCookies = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file) {
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
            return (0, _requestAsBrowser.loadCookieFile)(file);

          case 5:
            cookieJar.jar = _context.sent.jar;

          case 6:
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