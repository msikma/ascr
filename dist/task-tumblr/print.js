'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printTumblrInfo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                   * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                   */

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tables = require('../util/tables');

var _format = require('../util/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var printTumblrInfo = exports.printTumblrInfo = function printTumblrInfo(info, printRawData) {
  if (printRawData) {
    return console.log(info);
  }

  var metaData = {
    'Notes': info.notes,
    'Rating': info.isNSFW ? _chalk2.default.red('NSFW') : 'SFW',
    'Images': info.imageCount,
    'Date': (0, _format.formatDate)(info.date)
  };

  var mainData = {
    'Blog title': (0, _format.shortenString)(info.hasSource ? info.source.sourceName : info.blog.blogName, 50),
    'Blog URL': (0, _format.shortenString)(info.hasSource ? info.source.sourceSub : info.blog.blogSub, 50),
    'Summary': info.summary.length ? (0, _format.shortenString)(info.termSummary, 300) : false

    // A post is either a reblog, or a source post.
    // We'll display one of these two tables based on which one it is.
  };var reblogData = _extends({
    'Reblogger': (0, _format.shortenString)(info.blog && info.blog.blogSub, 50)
  }, info.tags.length > 0 ? _defineProperty({}, 'Reblogger\'s tags', info.tags) : {});
  var sourceData = {
    'Tags': info.tags
  };
  var additionalData = info.isReblog ? reblogData : sourceData;

  console.log((0, _tables.topTable)(metaData).toString());
  console.log((0, _tables.mainTable)(_extends({}, mainData, additionalData)).toString());
};