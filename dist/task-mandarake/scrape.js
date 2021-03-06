'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchShopSingle = exports.fetchEkizoSingle = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                     * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                     */

/** Removes extra whitespace from text. */
var cleanText = function cleanText(str) {
  return str.replace(/\t|\n/g, ' ').replace(/ +(?= )/g, '').trim();
};

/**
 * Parsers a regular shop item page and returns its data and images.
 */
var parseShopPage = function parseShopPage($, url) {
  try {
    var id = url.match(/itemCode=([0-9]+)&/)[1];
    var images = $('.detail_item .xzoom-thumbs li img').get().map(function (img) {
      return $(img).attr('src');
    });
    var itemName = cleanText($('.content_head .subject').text());
    var desc = cleanText($('.detail_panel .caption').text());
    var itemNumber = cleanText($('.detail_panel .__itemno').text());
    var price = cleanText($('.detail_panel .__price').text()) + '\u5186';
    return {
      titlePlain: itemName,
      title: id + ' ' + itemName,
      desc: '' + desc,
      price: price,
      itemNumber: itemNumber,
      url: url,
      images: images,
      imageCount: images.length
    };
  } catch (error) {
    return {
      error: error
    };
  }
};

/**
 * Parses an ekizo (auction) page and returns its data and images.
 */
var parseEkizoPage = function parseEkizoPage($, url) {
  try {
    var id = url.match(/index=([0-9]+)$/)[1];
    var $images = $('#itemImageUrlItems img#option');
    var images = $images.get().map(function (i) {
      return $(i).attr('src');
    });

    var itemName = cleanText($('#itemName').text());
    var desc = cleanText($('.item_description table').text());
    var size = cleanText($('.item_size').text());

    var crumbs = $('#breadcrumbItems a#option').get().reduce(function (cats, a) {
      var $a = $(a);
      var $inner = $('#label', a);
      var href = $a.attr('href');
      var text = cleanText($inner.text());
      // Don't keep the 'home' link or the item we're looking at now.
      if (text.toLowerCase() === 'home' || !href) {
        return cats;
      }
      return [].concat(_toConsumableArray(cats), [[text, href.trim()]]);
    }, []);

    var dateStart = new Date(cleanText($('#openDate').text()));
    var dateEnd = new Date(cleanText($('#strExtCloseDate').text()));
    var itemNumber = cleanText($('#itemNo').text());
    var price = cleanText($('#nowPrice-1').text()) + '\u5186';
    var bids = cleanText($('#bidCount').text());
    var condition = cleanText($('#isCondition dd').text());
    var timeLeft = cleanText($('#timeLeft').text());

    return {
      titlePlain: itemName,
      title: id + ' ' + itemName,
      desc: desc + '\n' + size,
      condition: condition,
      timeLeft: timeLeft,
      price: price,
      bids: bids,
      dateStart: dateStart,
      dateEnd: dateEnd,
      itemNumber: itemNumber,
      url: url,
      categories: crumbs,
      images: images,
      imageCount: images.length
    };
  } catch (error) {
    return {
      error: error
    };
  }
};

/**
 * Extracts the images from a single ekizo (auction) page.
 */
var fetchEkizoSingle = exports.fetchEkizoSingle = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    var html, $ekizoHTML, ekizoInfo;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _request.requestURL)(url);

          case 2:
            html = _context.sent;
            $ekizoHTML = _cheerio2.default.load(html);
            ekizoInfo = parseEkizoPage($ekizoHTML, url);
            return _context.abrupt('return', ekizoInfo);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchEkizoSingle(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Extracts the images from a single ekizo (auction) page.
 */
var fetchShopSingle = exports.fetchShopSingle = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
    var html, $shopHTML, itemInfo;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _request.requestURL)(url);

          case 2:
            html = _context2.sent;
            $shopHTML = _cheerio2.default.load(html);
            itemInfo = parseShopPage($shopHTML, url);
            return _context2.abrupt('return', itemInfo);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchShopSingle(_x2) {
    return _ref2.apply(this, arguments);
  };
}();