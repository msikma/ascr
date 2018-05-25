'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printPixivInfo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                   * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                   */

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tables = require('../util/tables');

var _format = require('../util/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a string representation of the work's rating.
 */
var getRating = function getRating(info) {
  if (info.isSFW) return 'SFW';
  if (info.isR18) return _chalk2.default.red('R-18');
  if (info.isR18G) return _chalk2.default.red('R-18G');
};

/**
 * Prints the basic image information we've scraped from Pixiv.
 * Contains e.g. the title of the work, the description, the author's name, etc.
 */
var printPixivInfo = exports.printPixivInfo = function printPixivInfo(info, printRawData) {
  if (printRawData) {
    return console.log(info);
  }

  if (info.isError) {
    console.log('ascr: error: Pixiv returned an error page; possibly the illustration does not exist or is private.');
    process.exit(1);
  }
  if (!info.isLoggedIn && !info.isSFW) {
    console.log('ascr: error: cannot download non-SFW images from Pixiv without being logged in.');
    process.exit(1);
  }

  var metaData = {
    'Views': info.score.views,
    'Likes': info.score.likes,
    'Images': info.imageCount,
    'Rating': getRating(info)
  };

  var mainData = _extends({
    'Title': (0, _format.shortenString)(info.title, 300),
    'Description': (0, _format.shortenString)(info.desc, 300),
    'Author': (0, _format.shortenString)(info.author.authorName, 50)
  }, info.tags.length > 0 ? { 'Tags': info.tags } : {});

  // If we're not logged in, print a warning banner.
  var warning = !info.isLoggedIn ? 'Warning: not logged in to Pixiv. Can\'t download high resolution files.\nSee readme.md for help on logging in.' : null;

  console.log((0, _tables.topTable)(metaData, warning).toString());
  console.log((0, _tables.mainTable)(mainData).toString());
};