'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestURL = undefined;

var _requestAsBrowser = require('requestAsBrowser');

var _requestAsBrowser2 = _interopRequireDefault(_requestAsBrowser);

var _cookies = require('./cookies');

var _cookies2 = _interopRequireDefault(_cookies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Safely requests and returns the HTML for a URL.
 *
 * This mimics a browser request to ensure we don't hit an anti-bot wall.
 */
var requestURL = exports.requestURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    var extraHeaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var gzip = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var req;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _requestAsBrowser2.default)(url, _cookies2.default.jar, extraHeaders, gzip);

          case 2:
            req = _context.sent;
            return _context.abrupt('return', req.body);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function requestURL(_x3) {
    return _ref.apply(this, arguments);
  };
}();