'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

/**
 * Checks whether something is an array or not.
 */
var isArray = exports.isArray = function isArray(v) {
  return v.constructor === Array || v.constructor.toString().indexOf(' Array()') > -1;
};