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
    var urls, name, author, cookies, dirMin, rawData, onlyData, type, inline, quiet, authorDir, noThread, overwrite, subset, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, url;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            urls = args.urls, name = args.name, author = args.author, cookies = args.cookies, dirMin = args.dirMin, rawData = args.rawData, onlyData = args.onlyData, type = args.type, inline = args.inline, quiet = args.quiet, authorDir = args.authorDir, noThread = args.noThread, overwrite = args.overwrite;
            subset = (0, _subset.subsetRange)(args.subset);

            // Prepare our cookies for usage in URL download requests.

            _context.next = 4;
            return (0, _cookies.loadCookies)(cookies);

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
              _context.next = 33;
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
            _context.next = 30;
            break;

          case 18:
            if (!(0, _taskTwitter.isTwitterURL)(url)) {
              _context.next = 23;
              break;
            }

            _context.next = 21;
            return (0, _taskTwitter.downloadTwitterURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, noThread, overwrite);

          case 21:
            _context.next = 30;
            break;

          case 23:
            if (!(0, _taskTumblr.isTumblrURL)(url)) {
              _context.next = 28;
              break;
            }

            _context.next = 26;
            return (0, _taskTumblr.downloadTumblrURL)(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite);

          case 26:
            _context.next = 30;
            break;

          case 28:
            console.log('ascr: error: not a recognized URL scheme: ' + url);
            process.exit(1);

          case 30:
            _iteratorNormalCompletion = true;
            _context.next = 11;
            break;

          case 33:
            _context.next = 39;
            break;

          case 35:
            _context.prev = 35;
            _context.t0 = _context['catch'](9);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 39:
            _context.prev = 39;
            _context.prev = 40;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 42:
            _context.prev = 42;

            if (!_didIteratorError) {
              _context.next = 45;
              break;
            }

            throw _iteratorError;

          case 45:
            return _context.finish(42);

          case 46:
            return _context.finish(39);

          case 47:
            _context.next = 53;
            break;

          case 49:
            _context.prev = 49;
            _context.t1 = _context['catch'](5);

            if (_context.t1.statusCode === 404) {
              console.log('ascr: error: given URL returned a page not found error (404)');
            } else {
              // FIXME
              console.log(_context.t1);
              console.log('ascr: error: ' + _context.t1.statusCode);
            }
            process.exit(1);

          case 53:
            return _context.abrupt('return', process.exit(0));

          case 54:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[5, 49], [9, 35, 39, 47], [40,, 42, 46]]);
  }));

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();