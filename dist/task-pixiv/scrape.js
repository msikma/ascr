'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPixivSingle = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _lodash = require('lodash');

var _script = require('../util/script');

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Used to switch a URL between different view modes (e.g. 'manga', 'medium').
var illustMode = new RegExp('(member_illust\\.php\\?mode=)(.+?)(&)');
// Extracts the ID from the URL.
var illustID = new RegExp('illust_id=([0-9]+)');

// Used to convert smaller/thumbnail image links into their original version.
// Use with imgReplace.
var imgType = new RegExp('(pximg\\.net)(.+)?(img-)([^/]+)(.+)(_master[0-9]+)');
var imgReplace = '$1$2$3original$5';

// Used to extract various information from a member's top page.
var memberID = new RegExp('member\\.php\\?.*id=([0-9]+)');
var memberAge = new RegExp('([0-9]+)');
var memberBday = new RegExp('([0-9]+)月([0-9]+)日');
var bioBr = new RegExp('<br\\s*/?>', 'ig');

/**
 * Turns a Pixiv URL into one we can more easily scrape.
 */
var pixivURLMode = function pixivURLMode(url) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'medium';

  return url.replace(illustMode, '$1' + type + '$3');
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
  return url.replace(imgType, imgReplace);
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
  var matches = ageText.match(memberAge);
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
  var matches = bdayText.match(memberBday);
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
 * Returns the URL for the image on a single image page.
 */
var scrapePixivSingleImage = function scrapePixivSingleImage($, url, isLoggedIn) {
  return {
    src: isLoggedIn ? [$('._illust_modal .wrapper img.original-image').attr('data-src'), url] : [$('.img-container img').attr('src'), url]
  };
};

/**
 * Returns data for a Pixiv animation. This involves parsing a <script> tag and running it in a sandbox
 * to extract the variables declared there.
 */
var scrapePixivAnimation = function scrapePixivAnimation($, url) {
  // Find all script tags, take their HTML values.
  var scripts = $('#wrapper script').map(function (n, tag) {
    return $(tag).html();
  }).get()
  // Keep only the one that has animation data.
  .filter(function (n) {
    return n.indexOf('ugokuIllustFullscreenData') > -1;
  });

  // We should have one <script> tag that conforms to our search. If not, something is wrong.
  // Probably means the scraping code is outdated.
  if (scripts.length === 0) {
    throw new TypeError('Could not extract animation info from Pixiv animation page');
  }

  try {
    // Add a 'pixiv' object to the script code, since it assumes it has already been defined.
    var data = (0, _script.findScriptData)('pixiv={context:{}};' + scripts[0]).sandbox.pixiv.context.ugokuIllustFullscreenData;

    // If all went well, we should have the animation data.
    // The animation's source images are contained in a zip file, which are then to be either
    // saved verbatim (if --no-gif was passed), or merged into an animated gif using the frame delay data.
    // To download the zip file, we need the work's URL to be the referrer.
    return {
      src: [data.src, url],
      frames: data.frames,
      frameCount: data.frames.length,
      duration: data.frames.reduce(function (acc, frame) {
        return acc + frame.delay;
      }, 0)
    };
  } catch (e) {
    throw new TypeError('Could not extract animation info from Pixiv animation page: ' + e);
  }
};

/**
 * Takes apart a Pixiv ?mode=medium page and extracts information.
 * Call with a Cheerio object, not a string of HTML data.
 *
 * We check whether we're logged in at this point as well.
 */
var parsePixivMedium = function parsePixivMedium($, url) {
  // Check if we're logged in. If we aren't, we cannot get original size images.
  var isLoggedIn = !$('link[rel="stylesheet"][href*="pre-login.css"]').length;

  // Check if this is an error page.
  var isError = $('.error-title').length > 0;
  if (isError) return { isError: isError, isLoggedIn: isLoggedIn

    // No error, so scrape the page.
  };var $info = isLoggedIn ? $('.work-info') : $('.cool-work');
  var $work = $('.works_display');
  var $author = isLoggedIn ? $('._user-profile-card .profile') : $('.userdata-row');

  var title = $('h1.title', $info).text().trim();
  var desc = $(isLoggedIn ? '.ui-expander-container p.caption' : '#caption_long', $info).text().trim();
  var views = Number($(isLoggedIn ? '.user-reaction .view-count' : '.cool-work-sub li.info:first-child .views', $info).text().trim());
  var likes = Number($(isLoggedIn ? '.user-reaction .rated-count' : '.cool-work-sub li.info:last-child .views', $info).text().trim());

  // I'm not entirely sure why the R-18 breadcrumbs don't always show up.
  // Or maybe it only doesn't show up on medium pages that lead to an RTL manga.
  // Either way, this should cover every possibility.
  var isR18Base = isLoggedIn ? $('.meta .r-18', $info).length > 0 : $('.breadcrumb a[href*="R-18"]').length > 0;
  var isR18GBase = isLoggedIn ? $('.meta .r-18g', $info).length > 0 : $('.breadcrumb a[href*="R-18G"]').length > 0;
  var isR18Image = $('.r18-image').length > 1;
  // R18G is only in the keywords...
  var isR18GKeyword = $('meta[name="keywords"]').attr('content').split(',').indexOf('R-18G') > -1;
  var isR18 = isR18Base || isR18Image;
  var isR18G = isR18GBase || isR18GKeyword;

  var isAnimation = $('._ugoku-illust-player-container', $work).length > 0;
  var tags = $(isLoggedIn ? '.tags .tag a.text' : '#tag_area .tag a.text').map(function (n, tag) {
    return $(tag).text().trim();
  }).get();
  var authorName = $(isLoggedIn ? '.user-name' : 'a', $author).text().trim();

  // When retrieving the author ID, it matters if we are logged in or not.
  // If not logged in, the ID can be found elsewhere. First, try the logged in version.
  var authorIDLI = $('.column-header .tabs a[href*="member.php?"]').attr('href');
  var authorIDRaw = authorIDLI ? authorIDLI : $('.userdata-row .name a[href*="member.php?"]').attr('href');
  var authorID = Number(authorIDRaw.match(memberID)[1]);

  // Note: when logged in, if this node doesn't exist, it's a single image page.
  // When NOT logged in, we don't know how many images there are. Save 'null' and figure it out later.
  var imageCount = isLoggedIn ? Number($('.page-count span', $work).text().trim()) || 1 : null;
  // If we're not logged in, run a check to see if there are multiple images at all
  // (there should be a link). That way we know to request and parse the manga page.
  var hasMultipleImages = isLoggedIn ? imageCount > 1 : $('.img-container a._work').hasClass('multiple');

  // If there's only one image, it will be right there on the page.
  // If not, we will return an empty array to fill in later.
  var images = [];
  if (!hasMultipleImages && !isAnimation) {
    images.push(scrapePixivSingleImage($, url, isLoggedIn));
  } else if (!hasMultipleImages && isAnimation) {
    images.push(scrapePixivAnimation($, url));
  }

  return {
    title: title,
    desc: desc,
    images: images,
    score: {
      views: views,
      likes: likes
    },
    author: {
      authorID: authorID,
      authorName: authorName
    },
    imageCount: imageCount,
    hasMultipleImages: hasMultipleImages,
    tags: tags,
    isSFW: !isR18 && !isR18G,
    isR18: isR18,
    isR18G: isR18G,
    isAnimation: isAnimation,
    isLoggedIn: isLoggedIn
  };
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
  var bio = bioRaw ? _he2.default.decode(bioRaw.replace(bioBr, '\n')) : null;

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
  var id = url.match(illustID)[1];
  var $containers = $('.item-container img.image');
  // Very confusing. jQuery's map() has the counter first. Regular map() has it after.
  var masterImages = $containers.map(function (n, img) {
    return $(img).attr('data-src').trim();
  }).get();
  var originalImages = masterImages.map(function (img, n) {
    return { src: [pixivImgToOriginal(img), pixivMangaBigLink(id, n)] };
  });
  return originalImages;
};

/**
 * Loads HTML for a Pixiv multiple images page (the 'manga' page)
 * and returns its images.
 */
var fetchPixivManga = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(mangaURL) {
    var html, $mangaHTML;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _request.requestURL)(mangaURL);

          case 2:
            html = _context.sent;
            $mangaHTML = _cheerio2.default.load(html);
            return _context.abrupt('return', parsePixivManga($mangaHTML, mangaURL));

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchPixivManga(_x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Loads HTML for a Pixiv author and returns information parsed from the page.
 */
var fetchPixivAuthor = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(authorURL) {
    var $authorHTML;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.t0 = _cheerio2.default;
            _context2.next = 3;
            return (0, _request.requestURL)(authorURL);

          case 3:
            _context2.t1 = _context2.sent;
            $authorHTML = _context2.t0.load.call(_context2.t0, _context2.t1);
            return _context2.abrupt('return', parsePixivAuthor($authorHTML));

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchPixivAuthor(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Extracts all information from a single Pixiv image page, including author information and image links.
 * We potentially need to fetch two additional pages to complete the work: the author's top page (to get
 * their profile information), and the work's 'see more' page (the 'manga' page, on works with multiple images).
 * This could potentially take some time.
 */
var fetchPixivSingle = exports.fetchPixivSingle = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(rawURL) {
    var includeAuthorInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var url, html, $mediumHTML, mediumInfo, tasks, info, data;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Ensure we're loading the ?mode=medium page.
            url = pixivURLMode(rawURL, 'medium');
            _context3.next = 3;
            return (0, _request.requestURL)(url);

          case 3:
            html = _context3.sent;
            $mediumHTML = _cheerio2.default.load(html);
            mediumInfo = parsePixivMedium($mediumHTML, url);

            // Return early if this is an error page.

            if (!mediumInfo.isError) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt('return', mediumInfo);

          case 8:

            // If there's only one image, it was on the medium page and we already have it.
            // If there are multiple images, we need to load the image detail page and scrape it.
            // Since we're also loading the author page, we'll load these in parallel.
            // If we're not logged in, we don't know how many images there are yet.
            tasks = [];

            if (mediumInfo.hasMultipleImages) {
              // Fetch HTML for the manga page and return the image links.
              tasks.push(fetchPixivManga(pixivURLMode(url, 'manga')));
            }
            if (includeAuthorInfo) {
              // Fetch the author's top page for their profile information.
              tasks.push(fetchPixivAuthor(pixivAuthorFromID(mediumInfo.author.authorID)));
            }

            // After we fetch the rest of the data, merge it all together.
            _context3.next = 13;
            return Promise.all(tasks);

          case 13:
            info = _context3.sent;
            data = _extends({}, mediumInfo, { author: _extends({}, mediumInfo.author) });

            if (mediumInfo.hasMultipleImages) {
              data.images = [].concat(_toConsumableArray(data.images), _toConsumableArray(info[0]));
            }
            if (includeAuthorInfo) {
              data.author = _extends({}, data.author, info[info.length - 1]);
            }

            // In case we are not logged in, we weren't able to get the image count earlier.
            return _context3.abrupt('return', _extends({}, data, { imageCount: data.images.length }));

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function fetchPixivSingle(_x5) {
    return _ref3.apply(this, arguments);
  };
}();