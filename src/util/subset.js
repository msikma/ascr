/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

/**
 * Checks if a value is numeric.
 */
const isNumeric = n => (
  !isNaN(parseFloat(n)) && isFinite(n)
)

/**
 * Parses a subset string, e.g. '3', '2-5', '3,5,7', '1-4,7', etc.
 * The given argument must be a string, not null.
 * Returns an array of numbers inside the range.
 */
export const subsetRange = (subsetString) => (
  subsetString.split(',')
    .map(s => {
      if (s === '') return []
      if (isNumeric(s)) return [Number(s)]
      // If the number is not a single value, assume it's a range like 3-6.
      const range = s.split('-').map(n => Number(n))
      return Array.from(new Array((range[1] - range[0]) + 1), (_, n) => n + range[0])
    })
    .reduce((a, b) => a.concat(b), [])
)
