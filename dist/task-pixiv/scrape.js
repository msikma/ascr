'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPixivSingle = exports.pixivAjaxURL = exports.pixivURLMode = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _lodash = require('lodash');

var _medium = require('./medium');

var _name = require('../util/name');

var _script = require('../util/script');

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Switch a URL between different view modes (e.g. 'manga', 'medium').
 */
var pixivURLMode = exports.pixivURLMode = function pixivURLMode(url) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'medium';

  if (~url.indexOf('artworks/')) return url;
  return url.replace(/(member_illust\.php\?mode=)(.+?)(&)/, '$1' + type + '$3');
};

/**
 * Returns a URL for making a JSON request for the images of a work.
 */
var pixivAjaxURL = exports.pixivAjaxURL = function pixivAjaxURL(id) {
  return 'https://www.pixiv.net/ajax/illust/' + id + '/pages';
};

/**
 * Returns the URL for a big image link inside of a manga page.
 * These URLs are needed when scraping the images, since they will return 403 forbidden
 * unless this URL is set as its referer.
 */
var pixivMangaBigLink = function pixivMangaBigLink(id, n) {
  return 'https://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=' + id + '&page=' + n;
};

/**
 * Returns a full URL for an author's top page from their ID.
 */
var pixivAuthorFromID = function pixivAuthorFromID(id) {
  return 'https://www.pixiv.net/member.php?id=' + id;
};

/**
 * Turns a Pixiv image link into its original, high resolution version.
 */
var pixivImgToOriginal = function pixivImgToOriginal(url) {
  return url.replace(/(pximg\.net)(.+)?(img-)([^/]+)(.+)(_master[0-9]+)/, '$1$2$3original$5');
};

/**
 * Used by parsePixivAuthor(). This is used to extract info from the profile tables.
 */
var filterTDs = function filterTDs($, $tds, text) {
  return $tds.filter(function (n, td) {
    return $(td).text() === text;
  });
};

/**
 * Returns the user's age if it is set, or null.
 */
var filterAge = function filterAge(ageText) {
  if (!ageText) {
    return null;
  }
  var matches = ageText.match(/([0-9]+)/);
  if (matches[1]) {
    return Number(matches[1]);
  }
  return null;
};

/**
 * Pad a single zero in front of a number if it is one number long.
 */
var padZero = function padZero(str) {
  if (str.length === 1) {
    return '0' + str;
  }
  return str;
};

/**
 * Extracts a timestamp from a Japanese date string.
 */
var filterBday = function filterBday(bdayText) {
  if (!bdayText) {
    return null;
  }
  var matches = bdayText.match(/([0-9]+)月([0-9]+)日/);
  if (matches[1] && matches[2]) {
    return padZero(matches[1]) + '-' + padZero(matches[2]);
  }
  return null;
};

/**
 * Returns what user input for gender. Pixiv only supports male/female at this time.
 */
var filterGender = function filterGender(genderText) {
  switch (genderText) {
    case '男性':
      return 'm';
    case '女性':
      return 'f';
    default:
      return null;
  }
};

/**
 * Scrapse a Pixiv member page and extracts information. We only extract profile information,
 * not work environment information. Every piece of information that isn't found is returned as null.
 * Call with a Cheerio object, not a string of HTML data.
 */
var parsePixivAuthor = function parsePixivAuthor($) {
  var $tables = $('.worksListOthers .ws_table.profile');
  var $profileTable = $($tables[0]);
  var $tds = $('.td1', $profileTable);

  // Default these to null (instead of an empty string) if they do not exist.
  var twitter = $('a[href*="jump.php?https%3A%2F%2Ftwitter.com"]', $profileTable).text().trim() || null;
  var homepage = filterTDs($, $tds, 'HPアドレス').next().text().trim() || null;
  // Note, Pixiv supports using linebreaks in the bio field, but no other HTML.
  // We convert to HTML, then manually replace <br> tags.
  // Since the HTML is encoded using numerical character references (e.g. &#x30B9; = ス) we decode it here as well.
  var bioRaw = filterTDs($, $tds, '自己紹介').next().html();
  var bio = bioRaw ? _he2.default.decode(bioRaw.replace(/<br\s*\/?>/ig, '\n')) : null;

  var gender = filterGender(filterTDs($, $tds, '性別').next().text().trim());
  var address = filterTDs($, $tds, '住所').next().text().trim() || null;
  var age = filterAge(filterTDs($, $tds, '年齢').next().text().trim());
  var bday = filterBday(filterTDs($, $tds, '誕生日').next().text().trim());
  var occupation = filterTDs($, $tds, '職業').next().text().trim() || null;

  return {
    twitter: twitter,
    bio: bio,
    homepage: homepage,
    gender: gender,
    address: address,
    age: age,
    bday: bday,
    occupation: occupation
  };
};

/**
 * Parses a Pixiv manga page to extract its image links.
 * Returns an array of images. Requires the original URL for extracting the ID.
 *
 * This code works for both LTR and RTL manga pages, which are completely different.
 * For the LTR page we fish the images out of the HTML. For RTL, we extract them
 * from a series of <script> tags.
 */
var parsePixivManga = function parsePixivManga($, url) {
  // Verify whether this is an RTL manga page or not.
  var isRTL = $('html').hasClass('_book-viewer', 'rtl');
  if (isRTL) {
    // Retrieve information about the images from the Javascript data.
    var scripts = $('script').map(function (n, tag) {
      return $(tag).html();
    }).get()
    // Keep only the ones that have image data.
    .filter(function (n) {
      return n.indexOf('pixiv.context.images[') > -1;
    });

    // We should have at least one <script> tag. One per image.
    if (scripts.length === 0) {
      throw new TypeError('Could not extract image info from Pixiv manga page');
    }

    try {
      // Pick up all the images from the <script> tags.
      var imageData = scripts.reduce(function (acc, scr) {
        // Set up a 'pixiv' object with the structure that the <script> tag expects.
        var scriptData = (0, _script.findScriptData)('\n          pixiv = {\n            context: {\n              images: [],\n              thumbnailImages: [],\n              originalImages: []\n            }\n          };\n          ' + scr + '\n        ');
        return (0, _lodash.merge)(acc, scriptData.sandbox);
      }, {});

      // Now all we need to do is add the current URL as referrer.
      var _originalImages = imageData.pixiv.context.originalImages.map(function (img) {
        return { src: [img, url] };
      });
      return _originalImages;
    } catch (e) {
      throw new TypeError('Could not extract image info from Pixiv manga page: ' + e);
    }
  }

  // On regular manga pages, it's a bit more straightforward.
  // Extract the ID from the URL.
  var id = url.match(/illust_id=([0-9]+)/)[1];
  var $containers = $('.item-container img.image');
  // Very confusing. jQuery's map() has the counter first. Regular map() has it after.
  var masterImages = $containers.map(function (n, img) {
    return $(img).attr('data-src').trim();
  }).get();
  var originalImages = masterImages.map(function (img, n) {
    return {
      srcMightBe: [(0, _name.swapExt)(pixivImgToOriginal(img)), pixivMangaBigLink(id, n)],
      src: [pixivImgToOriginal(img), pixivMangaBigLink(id, n)]
    };
  });

  return originalImages;
};

/**
 * Extracts images from Pixiv JSON requests.
 */
var fetchPixivImageJSON = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(id, referrer) {
    var url, res, data, images;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = pixivAjaxURL(id);
            _context.next = 3;
            return (0, _request.requestURL)(url);

          case 3:
            res = _context.sent;
            data = JSON.parse(res);
            images = (0, _lodash.get)(data, 'body', []);
            return _context.abrupt('return', images.map(function (img) {
              return { src: [img.urls.original, referrer] };
            }));

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchPixivImageJSON(_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Loads HTML for a Pixiv multiple images page (the 'manga' page)
 * and returns its images.
 */
var fetchPixivManga = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(mangaURL) {
    var html, $mangaHTML;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _request.requestURL)(mangaURL);

          case 2:
            html = _context2.sent;
            $mangaHTML = _cheerio2.default.load(html);
            return _context2.abrupt('return', parsePixivManga($mangaHTML, mangaURL));

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchPixivManga(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Loads HTML for a Pixiv author and returns information parsed from the page.
 */
var fetchPixivAuthor = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(authorURL) {
    var $authorHTML;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.t0 = _cheerio2.default;
            _context3.next = 3;
            return (0, _request.requestURL)(authorURL);

          case 3:
            _context3.t1 = _context3.sent;
            $authorHTML = _context3.t0.load.call(_context3.t0, _context3.t1);
            return _context3.abrupt('return', parsePixivAuthor($authorHTML));

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function fetchPixivAuthor(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Extracts all information from a single Pixiv image page, including author information and image links.
 * We potentially need to fetch two additional pages to complete the work: the author's top page (to get
 * their profile information), and the work's 'see more' page (the 'manga' page, on works with multiple images).
 * This could potentially take some time.
 * 
 * Pixiv recently removed their 'manga' pages (separate pages that contain all the images), in favor
 * of loading the images with JSON and adding them to the main illustration page.
 * It's still possible to load the 'manga' pages if they ever come back (they were AB testing it earlier)
 * but for now 'useJSONRequest' is true by default, which loads the JSON request.
 */
var fetchPixivSingle = exports.fetchPixivSingle = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(rawURL) {
    var includeAuthorInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var useJSONRequest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var url, html, $mediumHTML, mediumInfo, tasks, info, data;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // Ensure we're loading the ?mode=medium page, if this is an old style URL.
            url = pixivURLMode(rawURL, 'medium');
            _context4.next = 3;
            return (0, _request.requestURL)(url);

          case 3:
            html = _context4.sent;
            $mediumHTML = _cheerio2.default.load(html);
            mediumInfo = (0, _medium.parsePixivMedium)($mediumHTML, url);

            // Return early if this is an error page.

            if (!mediumInfo.isError) {
              _context4.next = 8;
              break;
            }

            return _context4.abrupt('return', mediumInfo);

          case 8:

            // If there's only one image, it was on the medium page and we already have it.
            // If there are multiple images, we need to load the image detail page and scrape it.
            // Since we're also loading the author page, we'll load these in parallel.
            // If we're not logged in, we don't know how many images there are yet.
            tasks = [];

            if (mediumInfo.hasMultipleImages) {
              // Fetch HTML for the manga page and return the image links.
              if (useJSONRequest) {
                tasks.push(fetchPixivImageJSON(mediumInfo.id, url));
              } else {
                tasks.push(fetchPixivManga(pixivURLMode(url, 'manga')));
              }
            }
            if (includeAuthorInfo) {
              // Fetch the author's top page for their profile information.
              tasks.push(fetchPixivAuthor(pixivAuthorFromID(mediumInfo.author.authorID)));
            }

            // After we fetch the rest of the data, merge it all together.
            _context4.next = 13;
            return Promise.all(tasks);

          case 13:
            info = _context4.sent;
            data = _extends({}, mediumInfo, { author: _extends({}, mediumInfo.author) });

            if (mediumInfo.hasMultipleImages) {
              data.images = [].concat(_toConsumableArray(data.images), _toConsumableArray(info[0]));
            }
            if (includeAuthorInfo) {
              data.author = _extends({}, data.author, info[info.length - 1]);
            }

            // In case we are not logged in, we weren't able to get the image count earlier.
            return _context4.abrupt('return', _extends({}, data, { imageCount: data.images.length }));

          case 18:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function fetchPixivSingle(_x8) {
    return _ref4.apply(this, arguments);
  };
}();