'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.htmlToTerm = exports.indentWrap = exports.bulletize = exports.shortenString = exports.formatDate = undefined;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _wrapAnsi = require('wrap-ansi');

var _wrapAnsi2 = _interopRequireDefault(_wrapAnsi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var leadingSpaceRe = new RegExp('(^[ ]+)', 'g');

/**
 * Returns a formatted date from a Javascript date.
 */
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

var formatDate = exports.formatDate = function formatDate(date) {
  return (0, _moment2.default)(date).format('Y-MM-DD');
};

/**
 * Shortens a string to a certain number of characters.
 * Also add [...] at the end of a shortened string.
 */
var shortenString = exports.shortenString = function shortenString(str, amount) {
  return str && str.length > amount ? str.substr(0, amount - 6) + ' [...]' : str;
};

/**
 * Adds strikethrough effect to text.
 * Fakes a strikethrough on terminals that don't support it.
 */
var addStrike = function addStrike(str) {
  return _chalk2.default.strikethrough(str.split('').join('\u0336'));
};

/**
 * Replaces a node with the output of a formatter function.
 */
var replaceNode = function replaceNode($, $selector, formatter) {
  return $selector.each(function (n, el) {
    var $el = $(el);
    $el.replaceWith(formatter($el.text()));
  });
};

/**
 * Replaces linebreaks with newlines.
 */
var replaceBreaks = function replaceBreaks($) {
  return $('br').replaceWith('\n');
};

/**
 * Replaces HTML blockquotes with indented text.
 */
var replaceBlockquotes = function replaceBlockquotes($) {
  var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
  var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'blockquote';

  var $nodes = void 0;
  var $nextNode = void 0;
  while (true) {
    $nodes = $(element);
    if (!$nodes.length) break;
    $nextNode = $($nodes[0]);
    $nextNode.replaceWith($nextNode.html().split('\n').join('\n' + ' '.repeat(indent)));
  }
};

/**
 * Removes empty lines and ensures all lines with content are separated by one (or two, if chosen), linebreaks.
 */
var filterLinebreaks = function filterLinebreaks(str) {
  var doubleBreak = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var trimmed = str.split('\n').map(function (s) {
    return s.trimRight();
  });
  return trimmed.filter(function (s) {
    return s !== '';
  }).join(doubleBreak ? '\n\n' : '\n');
};

/**
 * Adds a bullet to the start of a line. This should be used on lines wrapped by e.g. wrapLineWithIndent().
 */
var bulletize = exports.bulletize = function bulletize(line) {
  return line.split('\n').map(function (segment, n) {
    return n === 0 ? '\u2022 ' + segment : '  ' + segment;
  }).join('\n');
};

/**
 * Returns the number of leading spaces a line has.
 */
var getLeadingSpace = function getLeadingSpace(line) {
  var match = (0, _stripAnsi2.default)(line).match(leadingSpaceRe);
  return match ? match[0].length : 0;
};

/**
 * Wraps a single line, while keeping however many indent spaces it has.
 */
var wrapLineWithIndent = function wrapLineWithIndent(line, width, linebreak) {
  var indent = getLeadingSpace(line);
  return (0, _wrapAnsi2.default)(line, width - indent).split(linebreak).map(function (l) {
    return '' + ' '.repeat(indent) + l;
  }).join(linebreak);
};

/**
 * Wraps lines while keeping their ANSI codes (e.g. Terminal color codes) intact,
 * and without breaking leading indents.
 *
 * For example, a line starting with '   long text goes here' (which has 3 leading spaces)
 * is wrapped in such a way that each line we produce also has 3 leading spaces.
 */
var indentWrap = exports.indentWrap = function indentWrap(input, width) {
  var linebreak = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '\n';
  return input.split(linebreak).map(function (line) {
    return wrapLineWithIndent(line, width, linebreak);
  }).join(linebreak);
};

/**
 * Converts an HTML string to something we can display in a terminal.
 */
var htmlToTerm = exports.htmlToTerm = function htmlToTerm(html) {
  var convertLinebreaks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var $ = _cheerio2.default.load(html);
  replaceNode($, $('b, strong'), function (text) {
    return _chalk2.default.bold(text);
  });
  replaceNode($, $('i, em'), function (text) {
    return _chalk2.default.italic(text);
  });
  replaceNode($, $('a'), function (text) {
    return _chalk2.default.underline.green(text);
  });
  replaceNode($, $('strike'), function (text) {
    return addStrike(text);
  });
  replaceNode($, $('p'), function (text) {
    return '\n' + text + '\n';
  });
  replaceBlockquotes($);
  if (convertLinebreaks) {
    replaceBreaks($);
  }
  return filterLinebreaks($.text());
};