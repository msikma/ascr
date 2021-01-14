'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logDeep = undefined;

var _draftlog = require('draftlog');

var _draftlog2 = _interopRequireDefault(_draftlog);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Monkey patch the console object with draftlog.
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

_draftlog2.default.into(console);

var logDeep = exports.logDeep = function logDeep(obj) {
  console.log(_util2.default.inspect(obj, { showHidden: false, depth: 9, colors: true }));
};

var disableLogging = function disableLogging() {
  console.log = function () {};
};

exports.default = disableLogging;