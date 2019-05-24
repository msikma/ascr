'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _log = require('./util/log');

var _log2 = _interopRequireDefault(_log);

var _cookies = require('./util/cookies');

var _subset = require('./util/subset');

var _taskPixiv = require('./task-pixiv');

var _taskMandarake = require('./task-mandarake');

var _taskTwitter = require('./task-twitter');

var _taskTumblr = require('./task-tumblr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * This is run right after parsing the user's command line arguments.
 * We check what type of URL the user passed and call the appropriate script.
 * This scrapes the page, prints info, and downloads the files.
 *
 * All command line arguments are passed here.
 */
var run = exports.run = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(args) {
    var urls, name, author, cookies, cookiesIsDefault, tumblrJSON, tumblrJSONIsDefault, dirMin, rawData, onlyData, type, inline, quiet, authorDir, noThread, overwrite, subset, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, url;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            urls = args.urls, name = args.name, author = args.author, cookies = args.cookies, cookiesIsDefault = args.cookiesIsDefault, tumblrJSON = args.tumblrJSON, tumblrJSONIsDefault = args.tumblrJSONIsDefault, dirMin = args.dirMin, rawData = args.rawData, onlyData = args.onlyData, type = args.type, inline = args.inline, quiet = args.quiet, authorDir = args.authorDir, noThread = args.noThread, overwrite = args.overwrite;
            subset = (0, _subset.subsetRange)(args.subset);

            // Prepare our cookies for usage in URL download requests.

            _context.next = 4;
            return (0, _cookies.loadCookies)(cookies, cookiesIsDefault);

          case 4:

            // Completely silence all output if 'quiet' is 2.
            if (quiet === 2) {
              (0, _log2.default)();
            }

            _context.prev = 5;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 9;
            _iterator = urls[Symbol.iterator]();

          case 11:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 38;
              break;
            }

            url = _step.value;

            if (!(0, _taskPixiv.isPixivURL)(url)) {
              _context.next = 18;
              break;
            }

            _context.next = 16;
            return (0, _taskPixiv.downloadPixivURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, type, quiet, overwrite);

          case 16:
            _context.next = 35;
            break;

          case 18:
            if (!(0, _taskTwitter.isTwitterURL)(url)) {
              _context.next = 23;
              break;
            }

            _context.next = 21;
            return (0, _taskTwitter.downloadTwitterURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, noThread, overwrite);

          case 21:
            _context.next = 35;
            break;

          case 23:
            if (!(0, _taskTumblr.isTumblrURL)(url)) {
              _context.next = 28;
              break;
            }

            _context.next = 26;
            return (0, _taskTumblr.downloadTumblrURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite, tumblrJSON, tumblrJSONIsDefault);

          case 26:
            _context.next = 35;
            break;

          case 28:
            if (!(0, _taskMandarake.isMandarakeURL)(url)) {
              _context.next = 33;
              break;
            }

            _context.next = 31;
            return (0, _taskMandarake.downloadMandarakeURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite);

          case 31:
            _context.next = 35;
            break;

          case 33:
            console.log('ascr: error: not a recognized URL scheme: ' + url);
            process.exit(1);

          case 35:
            _iteratorNormalCompletion = true;
            _context.next = 11;
            break;

          case 38:
            _context.next = 44;
            break;

          case 40:
            _context.prev = 40;
            _context.t0 = _context['catch'](9);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 44:
            _context.prev = 44;
            _context.prev = 45;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 47:
            _context.prev = 47;

            if (!_didIteratorError) {
              _context.next = 50;
              break;
            }

            throw _iteratorError;

          case 50:
            return _context.finish(47);

          case 51:
            return _context.finish(44);

          case 52:
            _context.next = 58;
            break;

          case 54:
            _context.prev = 54;
            _context.t1 = _context['catch'](5);

            if (_context.t1.statusCode === 404) {
              console.log('ascr: error: given URL returned a page not found error (404)');
            } else {
              // FIXME
              console.log(_context.t1);
              console.log('ascr: error: ' + _context.t1.statusCode);
            }
            process.exit(1);

          case 58:
            return _context.abrupt('return', process.exit(0));

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[5, 54], [9, 40, 44, 52], [45,, 47, 51]]);
  }));

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();