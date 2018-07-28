/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import { loadCookieFile } from 'requestAsBrowser'

// Keep our cookies globally available.
const cookieJar = {
  jar: null
}

/**
 * Loads cookies from the specified cookies.txt file (or the default file)
 * and loads them into a jar so that we can make requests with them.
 *
 * Cookies must be exported from the browser in Netscape cookie file format.
 * Without cookies, all requests will be logged out. This particularly affects Pixiv.
 */
export const loadCookies = async (file, isDefault) => {
  // If passing a null value, just delete the jar and go back to logged out calls.
  if (!file) {
    cookieJar.jar = null
    return
  }
  try {
    cookieJar.jar = (await loadCookieFile(file)).jar
  }
  catch (err) {
    // Couldn't load cookie file.
    if (!isDefault) {
      console.warn(`ascr: warning: could not load cookie file: ${file}`)
    }
    cookieJar.jar = null
  }
}

export default cookieJar
