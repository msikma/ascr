'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDataViaOEmbed = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _lodash = require('lodash');

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
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
              console.log('ascr: error: could not retrieve post data (possibly EU GDPR redirect bug; try again later after Tumblr fixes their embeds, or set up an API key as per the readme)');
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

var fetchDataViaOEmbed = exports.fetchDataViaOEmbed = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(urlStr) {
    var oEmbedURL, oEmbedData;
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
            // Lastly we'll extract that link and get the data from there.
            _context2.next = 10;
            return getEmbeddedPostData(oEmbedData.html);

          case 10:
            return _context2.abrupt('return', _context2.sent);

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchDataViaOEmbed(_x2) {
    return _ref2.apply(this, arguments);
  };
}();