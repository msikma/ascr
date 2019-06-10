'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printGenericInfo = undefined;

var _format = require('../util/format');

var _tables = require('../util/tables');

/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

var printGenericInfo = exports.printGenericInfo = function printGenericInfo(info, printRawData) {
  if (printRawData) {
    return console.log(info);
  }

  var metaData = {
    'Site': info.domain,
    'Title': info.title
  };

  var mainData = {
    'URL': (0, _format.shortenString)(info.url, 52, true),
    'Images': String(info.imageCount),
    'Language': info.lang
  };

  console.log((0, _tables.topTable)(metaData).toString());
  console.log((0, _tables.mainTable)(mainData).toString());
};