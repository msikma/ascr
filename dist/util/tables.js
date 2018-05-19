'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mainTable = exports.topTable = exports.progressBar = undefined;

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _format = require('./format');

var _isArray = require('./isArray');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                     * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                     */

// Width of the rightmost column in characters.
var width = 54;
// Maximum number of items permitted in arrays.
var arrayMax = 12;
// Width of the progress bar. Should be the size of the whole table.
var progressBarWidth = 77;

// Breaks very long words up by adding linebreaks to them.
var breakWords = function breakWords(str) {
  var w = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : width;
  return str.split(' ').map(function (word) {
    var buffer = word;
    var broken = '';
    var segment = void 0;
    while (true) {
      segment = _cliTable.utils.truncateWidthWithAnsi(buffer, w - 2);
      if (segment.length < 1) {
        break;
      }
      broken += segment + '\n';
      buffer = buffer.substr(segment.length);
    }
    // Remove the last linebreak since it's unnecessary.
    return broken.substr(0, broken.length - 1);
  }).join(' ');
};

/**
 * Renders a progress bar based on the number of images downloaded and total.
 */
var progressBar = exports.progressBar = function progressBar(a, z) {
  var factor = progressBarWidth / z;
  var prog = Math.floor(a * factor);
  return '█'.repeat(prog) + '░'.repeat(progressBarWidth - prog);
};

/**
 * Constructs a 'top' information table. This contains extra information,
 * such as the number of views and the rating of the work.
 * It can only have at most four columns.
 */
var topTable = exports.topTable = function topTable(kvData, warning) {
  var table = new _cliTable2.default({ colWidths: [18, 18, 18, 18] });
  table.push(Object.keys(kvData).map(function (cell) {
    return _chalk2.default.blue(cell);
  }));
  table.push(Object.values(kvData));
  if (warning) {
    table.push([{ colSpan: 4, content: _chalk2.default.red(warning) }]);
  }
  return table;
};

/**
 * Constructs a 'main' information table. This is a vertical table with columns on the left,
 * and values on the right. Contains e.g. title, description, author name.
 */
var mainTable = exports.mainTable = function mainTable(kvData) {
  var table = new _cliTable2.default({ colWidths: [18, 56], wordWrap: false });
  var keys = Object.keys(kvData);
  table.push.apply(table, _toConsumableArray(keys.reduce(function (acc, k) {
    // If the value is an array, we'll we'll display it as a series
    // of lines with linebreaks. Limit the list to a maximum number of lines.
    var v = kvData[k];
    // Don't display a value if it's false, null or undefined.
    if (v === false || v == null) {
      return acc;
    }
    if ((0, _isArray.isArray)(v) && v.length > arrayMax) {
      v = [].concat(_toConsumableArray(v.slice(0, arrayMax - 1)), ['[...' + (v.length - (arrayMax - 1)) + ' more]']);
    }
    return [].concat(_toConsumableArray(acc), [[_chalk2.default.blue(k),
    // If the value is an array, wrap each item individually.
    (0, _isArray.isArray)(v) ? v.map(function (i) {
      return (0, _format.bulletize)((0, _format.indentWrap)(i, width - 2));
    }).join('\n') : (0, _format.indentWrap)(breakWords(v), width)]]);
  }, [])));
  return table;
};