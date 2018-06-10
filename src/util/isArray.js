/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

/**
 * Checks whether something is an array or not.
 */
export const isArray = v => v.constructor === Array || v.constructor.toString().indexOf(' Array()') > -1
