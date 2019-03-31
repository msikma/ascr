'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestURL = exports.downloadFileAsBrowser = exports.browserHeaders = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cookies = require('./cookies');

var _cookies2 = _interopRequireDefault(_cookies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Headers similar to what a regular browser would send.
var browserHeaders = exports.browserHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'

  // Default settings for requests.
};var requestDefaults = {
  gzip: true

  /**
   * Starts downloading a file to a path, and returns a promise that resolves
   * after the file has been fully saved. A pipe is used to write the file,
   * meaning that the file will be gradually filled with data, and on premature exit
   * the file will have partial data.
   *
   * mightBe: Special hack for Pixiv: a file might be a jpg, or it might be a png.
   * This is the least expensive way to check when downloading a lot of files.
   */
};var downloadFileAsBrowser = exports.downloadFileAsBrowser = function downloadFileAsBrowser(url, name) {
  var useCookieJar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _cookies2.default.jar;
  var extraHeaders = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var gzip = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var reqOverrides = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var mightBeURL = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var mightBeName = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  return new Promise(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var args, r, rTwo;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              args = _extends({ headers: _extends({}, browserHeaders, extraHeaders), jar: useCookieJar, gzip: gzip }, reqOverrides);
              _context.prev = 1;
              _context.next = 4;
              return pipeFile(_extends({}, args, { url: url }), name);

            case 4:
              r = _context.sent;

              resolve(_extends({}, r));
              _context.next = 22;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context['catch'](1);

              console.log(_context.t0);
              _fs2.default.unlinkSync(name);
              _context.prev = 12;
              _context.next = 15;
              return pipeFile(_extends({}, args, { url: mightBeURL }), mightBeName);

            case 15:
              rTwo = _context.sent;
              return _context.abrupt('return', resolve(_extends({}, rTwo)));

            case 19:
              _context.prev = 19;
              _context.t1 = _context['catch'](12);

            case 21:
              return _context.abrupt('return', reject(_context.t0));

            case 22:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[1, 8], [12, 19]]);
    }));

    return function (_x7, _x8) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * Pipe a download to a file on the local disk.
 */
var pipeFile = function pipeFile(args, name) {
  return new Promise(function (resolve, reject) {
    (0, _request2.default)(args).on('response', function (response) {
      if (response.statusCode === 404) {
        return reject();
      }
    }).on('error', function (err) {
      reject(err);
    }).pipe(_fs2.default.createWriteStream(name));
  });
};

/**
 * Saves binary data to a destination file.
 */
var saveBinaryFile = function saveBinaryFile(data, dest) {
  return new Promise(function (resolve, reject) {
    _fs2.default.writeFile(dest, data, { encoding: 'binary' }, function (err) {
      if (err) return reject();
      return resolve();
    });
  });
};

// Requests a URI using our specified browser headers as defaults.
// This function has a higher chance of being permitted by the source site
// since it's designed to look like a normal browser request rather than a script.
// The request() function returns a promise, so remember to await.
var requestURL = exports.requestURL = function requestURL(url) {
  var fullResponse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var etc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var useCookieJar = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _cookies2.default.jar;
  return new Promise(function (resolve, reject) {
    return (0, _request2.default)(_extends({ url: url, headers: _extends({}, browserHeaders, headers != null ? headers : {}) }, requestDefaults, etc, useCookieJar ? { jar: useCookieJar } : {}), function (err, res, body) {
      if (err) return reject(err);
      resolve(fullResponse ? res : body);
    });
  });
};