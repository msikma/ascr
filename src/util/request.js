/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import requestAsBrowser from 'requestAsBrowser'
import cookieJar from './cookies'

/**
 * Safely requests and returns the HTML for a URL.
 *
 * This mimics a browser request to ensure we don't hit an anti-bot wall.
 */
export const requestURL = async (url, extraHeaders = {}, gzip = true) => {
  const req = await requestAsBrowser(url, cookieJar.jar, extraHeaders, gzip)
  return req.body
}
