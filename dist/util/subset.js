'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

/**
 * Checks if a value is numeric.
 */
var isNumeric = function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Parses a subset string, e.g. '3', '2-5', '3,5,7', '1-4,7', etc.
 * The given argument must be a string, not null.
 * Returns an array of numbers inside the range.
 */
var subsetRange = exports.subsetRange = function subsetRange(subsetString) {
  return subsetString.split(',').map(function (s) {
    if (s === '') return [];
    if (isNumeric(s)) return [Number(s)];
    // If the number is not a single value, assume it's a range like 3-6.
    var range = s.split('-').map(function (n) {
      return Number(n);
    });
    return Array.from(new Array(range[1] - range[0] + 1), function (_, n) {
      return n + range[0];
    });
  }).reduce(function (a, b) {
    return a.concat(b);
  }, []);
};