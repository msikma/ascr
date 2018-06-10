'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePixivMedium = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _lodash = require('lodash');

var _scrape = require('./scrape');

var _mediumLegacy = require('./medium-legacy');

var _script = require('../util/script');

var _format = require('../util/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                   * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                   */

/**
 * Returns the illustration ID for a URL.
 */
var pixivIllustID = function pixivIllustID(url) {
  var matches = url.match(/illust_id=([0-9]+)/);
  return matches && parseInt(matches[1], 10);
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
var parsePixivMedium = exports.parsePixivMedium = function parsePixivMedium($, url) {
  var _ref;

  // Check if we're seeing an older version of the page.
  var versionUntilMay2018 = $('.works_display').length > 0;

  if (versionUntilMay2018) {
    return (0, _mediumLegacy.parsePixivMediumUntilMay2018)($, url);
  }

  // Check if this is an error page.
  var isError = $('.error-title').length > 0;
  if (isError) return { isError: isError, isLoggedIn: isLoggedIn

    // No error, so scrape the page.
    // The new (post late May 2018) page has a convenient JS object full of all the information we need.
    // There's no actual HTML on the server side.
  };var illustID = pixivIllustID(url);
  var bootstrapJS = $('script').get().map(function (s) {
    return $(s).html();
  }).filter(function (s) {
    return s.indexOf('globalInitData') > -1;
  });
  var bootstrapData = (0, _script.findScriptData)(bootstrapJS).sandbox.globalInitData;
  var illustData = bootstrapData.preload.illust[illustID];
  var userData = bootstrapData.preload.user[illustData.userId];

  // Now we just pick the data right out of the bootstrap object.
  var title = illustData.illustTitle;
  var desc = (0, _format.htmlToTerm)(illustData.illustComment, true);
  var dateCreation = illustData.createDate;
  var dateUpload = illustData.uploadDate;
  var likes = illustData.likeCount;
  var views = illustData.viewCount;
  var authorID = userData.userId;
  var authorName = userData.name;
  var imageCount = illustData.pageCount;
  var hasMultipleImages = imageCount > 1;
  var tags = illustData.tags.tags.map(function (t) {
    return '' + t.tag + (t.translation && t.translation.en ? ' (' + t.translation.en + ')' : '');
  });

  var isSFW = illustData.xRestrict === 0;
  var isR18 = illustData.xRestrict === 1;
  var isR18G = illustData.xRestrict === 2;

  // Note:
  // * illustType 0 = single image
  // * illustType 1 = ?
  // * illustType 2 = animation
  var isAnimation = illustData.illustType === 2;
  var isLoggedIn = !$('link[rel="stylesheet"][href*="pre-login.css"]').length;

  var images = imageCount === 1 ? [{ src: [illustData.urls.original, (0, _scrape.pixivURLMode)(url, 'manga')] }] : [];

  return _ref = {
    title: title,
    desc: desc,
    images: images,
    dateCreation: dateCreation,
    dateUpload: dateUpload,
    score: {
      views: views,
      likes: likes
    },
    author: {
      authorID: authorID,
      authorName: authorName
    }
  }, _defineProperty(_ref, 'images', images), _defineProperty(_ref, 'imageCount', imageCount), _defineProperty(_ref, 'hasMultipleImages', hasMultipleImages), _defineProperty(_ref, 'tags', tags), _defineProperty(_ref, 'isSFW', isSFW), _defineProperty(_ref, 'isR18', isR18), _defineProperty(_ref, 'isR18G', isR18G), _defineProperty(_ref, 'isAnimation', isAnimation), _defineProperty(_ref, 'isLoggedIn', isLoggedIn), _ref;
};