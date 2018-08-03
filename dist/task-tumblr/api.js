'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDataViaAPI = exports.findAPIKeys = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _tumblr = require('tumblr.js');

var _tumblr2 = _interopRequireDefault(_tumblr);

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

var _files = require('../util/files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var client = void 0;

/**
 * Initialize the API client.
 */
var initializeClient = function initializeClient(credentials) {
  client = _tumblr2.default.createClient({ credentials: credentials, returnPromises: true });
};

/**
 * Returns the API keys from the user's tumblr.json file, if it exists.
 * If no keys could be found, false is returned. In that case we'll use the oEmbed route
 * to get a post URL's information.
 */
var findAPIKeys = exports.findAPIKeys = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var tumblrJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var isDefault = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (tumblrJSON) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', false);

          case 2:
            _context.prev = 2;
            _context.t0 = JSON;
            _context.next = 6;
            return (0, _files.readFile)(tumblrJSON);

          case 6:
            _context.t1 = _context.sent;
            data = _context.t0.parse.call(_context.t0, _context.t1);

            if (!(data.consumer_key && data.consumer_secret)) {
              _context.next = 10;
              break;
            }

            return _context.abrupt('return', data);

          case 10:
            console.log('ascr: error: found a tumblr.json file, but it did not contain \'consumer_key\' or \'consumer_secret\'.');
            _context.next = 16;
            break;

          case 13:
            _context.prev = 13;
            _context.t2 = _context['catch'](2);

            // Only log an error if the user specified a non-default.
            if (!isDefault) {
              console.warn('ascr: warning: could not load tumblr.json file: ' + tumblrJSON);
            }

          case 16:
            return _context.abrupt('return', false);

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 13]]);
  }));

  return function findAPIKeys() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Extracts the blog name and post ID.
 */
var getURLInfo = function getURLInfo(urlStr) {
  try {
    // Get the hostname of the URL. We don't need to remove .tumblr.com.
    var blog = new _urlParse2.default(urlStr).host;
    var idMatches = urlStr.match(/post\/([0-9]+)\/?/);

    return {
      blog: blog,
      id: idMatches[1]
    };
  } catch (err) {
    return { blog: null, id: null };
  }
};

/**
 * Connect to the Tumblr API and retrieve post information about the URL.
 * This information is then fed back to the post scraper. Both the oEmbed method
 * and the API method retrieve essentially the same data.
 */
var fetchDataViaAPI = exports.fetchDataViaAPI = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(urlStr, apiKeys) {
    var _getURLInfo, blog, id, postData;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // Connect with our API keys.
            if (!client) initializeClient(apiKeys);

            _getURLInfo = getURLInfo(urlStr), blog = _getURLInfo.blog, id = _getURLInfo.id;

            if (!blog || !id) {
              console.log('ascr: error: could not get a valid blog name and ID from the given URL.');
              process.exit(0);
            }
            _context2.next = 5;
            return client.blogPosts(blog, { id: id, reblog_info: true, notes_info: true });

          case 5:
            postData = _context2.sent;
            return _context2.abrupt('return', _extends({}, postData, postData.posts[0]));

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchDataViaAPI(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();