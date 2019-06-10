'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printMandarakeInfo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                   * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                   */

var _tables = require('../util/tables');

var _format = require('../util/format');

/**
 * Prints the basic image information we've scraped from Pixiv.
 * Contains e.g. the title of the work, the description, the author's name, etc.
 */
var printMandarakeInfo = exports.printMandarakeInfo = function printMandarakeInfo(info, printRawData) {
  if (printRawData) {
    return console.log(info);
  }

  if (info.isError) {
    console.log('ascr: error: Mandarake returned an error page; possibly the item does not exist.');
    process.exit(1);
  }

  var metaData = {
    'Price': info.price,
    'Bids': info.bids,
    'Images': info.imageCount,
    'Time left': info.timeLeft
  };

  var categories = info.categories.map(function (c) {
    return c[0];
  });

  var mainData = _extends({
    'Title': (0, _format.shortenString)(info.title, 300),
    'Description': (0, _format.shortenString)(info.desc, 300)
  }, info.categories.length > 0 ? { 'Category': categories } : {});

  console.log((0, _tables.topTable)(metaData).toString());
  console.log((0, _tables.mainTable)(mainData).toString());
};