'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTumblrSingle = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _lodash = require('lodash');

var _oembed = require('./oembed');

var _api = require('./api');

var _format = require('../util/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                     * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                     */

/**
 * Retrieves all <img src="..." /> links from a snippet of HTML.
 */
var getImagesFromHTML = function getImagesFromHTML(html) {
  var $ = _cheerio2.default.load(html);
  var images = $('img').map(function (n, img) {
    return $(img).attr('src');
  }).get();
  return images;
};

/**
 * Returns all images found in an embedded post.
 * This includes the main image (for a photo post, for example) and all images
 * seen in the user replies to the post.
 */
var getImagesFromPost = function getImagesFromPost(embeddedPostData, authorSub) {
  // Retrieve the images. Posts that have replies from other people can have images, too.
  // That's why we keep an 'author' field for every individual image.
  var trailData = embeddedPostData.trail || [];
  var postData = embeddedPostData.photos || [];
  var trailImages = trailData.reduce(function (acc, post) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(getImagesFromHTML(post.content_raw).map(function (img) {
      return { src: [img, null], author: post.blog.name };
    })));
  }, []);
  var postImages = postData.reduce(function (acc, photo) {
    return [].concat(_toConsumableArray(acc), [{ src: [photo.original_size.url, null], author: authorSub }]);
  }, []);
  return [].concat(_toConsumableArray(postImages), _toConsumableArray(trailImages));
};

/**
 * Returns only the scheme and host of a URL.
 * e.g. http://site.com/path is returned as just http://site.com/
 */
var getBaseURL = function getBaseURL(urlStr) {
  if (!urlStr) return null;

  var _url$parse = _url2.default.parse(urlStr),
      protocol = _url$parse.protocol,
      host = _url$parse.host;

  return protocol + '//' + host + '/';
};

/**
 * Retrieve data we're interested in from the embedded post data.
 * Tumblr gives us a lot of interesting information. Although we only need
 * a couple of fields, the rest can be displayed in a table while downloading.
 */
var scrapeRelevantData = function scrapeRelevantData(embeddedPostData) {
  if (!embeddedPostData) return null;

  // Extract all the data we're interested in.
  var blogName = embeddedPostData.blog.title;
  var blogSub = embeddedPostData.blog.name;
  var blogURL = embeddedPostData.blog.url;
  var slug = embeddedPostData.slug;
  var isNSFW = embeddedPostData.is_nsfw;
  // Some discrepancy here between oEmbed and API data.
  var isPrivate = (0, _lodash.get)(embeddedPostData, 'share_popover_data.is_private') != null ? (0, _lodash.get)(embeddedPostData, 'share_popover_data.is_private') !== 0 : (0, _lodash.get)(embeddedPostData, 'state') !== 'private';
  var id = embeddedPostData.id;
  var postURL = embeddedPostData.post_url;
  var date = new Date(embeddedPostData.date);
  var tags = embeddedPostData.tags;
  var summary = embeddedPostData.summary;
  var notes = (0, _lodash.get)(embeddedPostData, 'notes.count', embeddedPostData.notes.length);
  var isReblog = embeddedPostData.is_reblog;
  var hasSource = embeddedPostData.has_source;
  var urlShort = (0, _lodash.get)(embeddedPostData, 'share_popover_data.post_tiny_url', embeddedPostData.short_url);

  var sourceName = embeddedPostData.reblogged_root_title;
  var sourceSub = embeddedPostData.reblogged_root_name;
  // We need to extract the author's full URL from the source_url to be safe.
  var sourceURL = getBaseURL(embeddedPostData.source_url);

  // Get all images out of the posts found in the embed.
  var images = getImagesFromPost(embeddedPostData, sourceSub || blogSub);

  return _extends({
    slug: slug,
    id: id,
    images: images,
    imageCount: images.length,
    isNSFW: isNSFW,
    isPrivate: isPrivate,
    isReblog: isReblog,
    url: postURL,
    urlShort: urlShort,
    date: date,
    tags: tags,
    notes: notes,
    summary: summary,
    termSummary: (0, _format.htmlToTerm)(embeddedPostData.caption),
    hasSource: hasSource
  },
  // Include source only if it's available.
  hasSource ? { source: { sourceURL: sourceURL, sourceName: sourceName, sourceSub: sourceSub } } : {}, {
    blog: {
      blogURL: blogURL,
      blogName: blogName,
      blogSub: blogSub
    }
  });
};

/**
 * Main entry point. Takes a Tumblr URL and retrieves its contents in a structured form.
 * To get the data we need to do two request calls.
 */
var fetchTumblrSingle = exports.fetchTumblrSingle = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(urlStr) {
    var tumblrJSON = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var isDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var apiKeys;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _api.findAPIKeys)(tumblrJSON, isDefault);

          case 2:
            apiKeys = _context.sent;

            if (apiKeys) {
              _context.next = 9;
              break;
            }

            _context.t0 = scrapeRelevantData;
            _context.next = 7;
            return (0, _oembed.fetchDataViaOEmbed)(urlStr);

          case 7:
            _context.t1 = _context.sent;
            return _context.abrupt('return', (0, _context.t0)(_context.t1));

          case 9:
            _context.t2 = scrapeRelevantData;
            _context.next = 12;
            return (0, _api.fetchDataViaAPI)(urlStr, apiKeys);

          case 12:
            _context.t3 = _context.sent;
            return _context.abrupt('return', (0, _context.t2)(_context.t3));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchTumblrSingle(_x3) {
    return _ref.apply(this, arguments);
  };
}();