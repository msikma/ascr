'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _draftlog = require('draftlog');

var _draftlog2 = _interopRequireDefault(_draftlog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Monkey patch the console object with draftlog.
_draftlog2.default.into(console); /**
                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                   * Copyright © 2018, Michiel Sikma
                                   */

var disableLogging = function disableLogging() {
  console.log = function () {};
};

exports.default = disableLogging;