"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

/**
 * Checks whether something is an array or not.
 */
var isArray = exports.isArray = function isArray(v) {
  return v.constructor === Array;
};