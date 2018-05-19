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

var _request = require('../util/request');

var _format = require('../util/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                     * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                     */

/**
 * Gives the oEmbed URL for a Tumblr post.
 */
var getOEmbedURL = function getOEmbedURL(urlStr) {
  return 'https://www.tumblr.com/oembed/1.0?url=' + encodeURIComponent(urlStr);
};

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
  var trailImages = embeddedPostData.trail.reduce(function (acc, post) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(getImagesFromHTML(post.content_raw).map(function (img) {
      return { src: [img, null], author: post.blog.name };
    })));
  }, []);
  var postImages = embeddedPostData.photos.reduce(function (acc, photo) {
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
  // Extract all the data we're interested in.
  var blogName = embeddedPostData.blog.title;
  var blogSub = embeddedPostData.blog.name;
  var blogURL = embeddedPostData.blog.url;
  var slug = embeddedPostData.slug;
  var isNSFW = embeddedPostData.is_nsfw;
  var isPrivate = embeddedPostData.share_popover_data.is_private !== 0;
  var id = embeddedPostData.id;
  var postURL = embeddedPostData.post_url;
  var date = new Date(embeddedPostData.date);
  var tags = embeddedPostData.tags;
  var summary = embeddedPostData.summary;
  var notes = embeddedPostData.notes.count;
  var isReblog = embeddedPostData.is_reblog;
  var hasSource = embeddedPostData.has_source;
  var urlShort = embeddedPostData.share_popover_data.post_tiny_url;

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
 * Takes an oEmbed HTML snippet and follows its embedded post URL.
 * It then takes the data from that post URL and returns it.
 */
var getEmbeddedPostData = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(oEmbedHTML) {
    var $oembed, postURL, postHTML, $post, bootstrapData, postData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // The link we need is in a <div class="tumblr-post" data-href="..." ...>
            $oembed = _cheerio2.default.load(oEmbedHTML);
            postURL = $oembed('.tumblr-post').attr('data-href').trim();
            _context.next = 4;
            return (0, _request.requestURL)(postURL);

          case 4:
            postHTML = _context.sent;


            // We've now retrieved the embedded post HTML.
            // The data is in <noscript data-bootstrap="...">
            $post = _cheerio2.default.load(postHTML);
            bootstrapData = JSON.parse($post('noscript[data-bootstrap]').attr('data-bootstrap').trim());
            // Ignore most of the metadata and return only the post data.

            postData = (0, _lodash.get)(bootstrapData, 'Components.EmbeddablePost.posts_data[0]');


            if (!postData) {
              // FIXME: Tumblr, for some reason, has decided to redirect everyone in the EU viewing an embed URL.
              // It 303 "See Other" redirects users to a /privacy/consent page, which is broken.
              // Since the page is broken, it redirects to the Tumblr homepage. Where of course we don't have this data.
              // My guess is they are trying to implement GDPR (a little late...), but either screwed up or realized
              // they can't do it in time, so they just broke it for everyone in the EU. Outside of the EU everything works.
              // So if we don't have 'postData' at this point, it COULD be that this is the "GDPR redirect bug."
              console.log('ascr: error: could not retrieve post data (possibly EU GDPR redirect bug; try again later after Tumblr fixes their embeds)');
              process.exit(1);
            }

            return _context.abrupt('return', postData);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getEmbeddedPostData(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Main entry point. Takes a Tumblr URL and retrieves its contents in a structured form.
 * To get the data we need to do two request calls.
 */
var fetchTumblrSingle = exports.fetchTumblrSingle = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(urlStr) {
    var oEmbedURL, oEmbedData, embeddedPostData;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // To get the data, we need to load the oEmbed data first.
            // This contains an embed link with all the information we need,
            // without the user's custom theme to make scraping difficult.
            oEmbedURL = getOEmbedURL(urlStr);
            _context2.t0 = JSON;
            _context2.next = 4;
            return (0, _request.requestURL)(oEmbedURL);

          case 4:
            _context2.t1 = _context2.sent;
            oEmbedData = _context2.t0.parse.call(_context2.t0, _context2.t1);


            // Handle common errors.
            if (!oEmbedData) {
              console.log('ascr: error: could not retrieve post data');
              process.exit(1);
            }
            if (oEmbedData && oEmbedData.meta && oEmbedData.meta.status === 404) {
              console.log('ascr: error: given URL returned a page not found error (404)');
              process.exit(1);
            }

            // The oEmbed data contains an HTML snippet with the link we need.
            // Load that link and extract its data.
            _context2.next = 10;
            return getEmbeddedPostData(oEmbedData.html);

          case 10:
            embeddedPostData = _context2.sent;
            return _context2.abrupt('return', scrapeRelevantData(embeddedPostData));

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchTumblrSingle(_x2) {
    return _ref2.apply(this, arguments);
  };
}();