'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchGenericURL = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _name = require('../util/name');

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Parses a page which may or may not have images.
var parsePage = function parsePage($, baseURL, url) {
  var $a = $('a');
  var imgLinks = $a.get().map(function (a) {
    return $(a).attr('href');
  }).filter(function (url) {
    return (/\.(jpg|jpeg|png|gif|bmp)$/.test(url)
    );
  });
  var imgAbs = imgLinks.map(function (url) {
    if (url.startsWith('/') || /^https?:\/\//.test(url) || url.startsWith('ftp://')) {
      return url;
    } else {
      return baseURL + '/' + url;
    }
  });
  var title = $('head title').text().trim();
  var lang = $('html').attr('lang') || 'n/a';
  var domain = (0, _name.getURLDomain)(url);
  var page = (0, _name.getURLPage)(url);

  return {
    title: title,
    lang: lang,
    baseURL: baseURL,
    url: url,
    page: page,
    domain: domain,
    images: imgAbs.map(function (url) {
      return { src: [url, null] };
    }),
    imageCount: imgAbs.length
  };
};

var fetchGenericURL = exports.fetchGenericURL = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    var baseURL, html, $postHTML;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            baseURL = url.split('/').slice(0, -1).join('/');
            _context.next = 3;
            return (0, _request.requestURL)(url);

          case 3:
            html = _context.sent;


            // Parse the HTML (if it's there) and pass it on along with any errors.
            $postHTML = _cheerio2.default.load(html);
            return _context.abrupt('return', parsePage($postHTML, baseURL, url));

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchGenericURL(_x) {
    return _ref.apply(this, arguments);
  };
}();