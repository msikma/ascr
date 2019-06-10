/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import FileCookieStore from 'tough-cookie-file-store-sync'
import request from 'request'

// Keep our cookies globally available.
const cookieJar = {
  jar: null
}

/**
 * Loads cookies from a specified cookies.txt file and loads them into
 * a jar so that we can make requests with them.
 */
const loadCookieFile = (cookieFile) => (
  new Promise((resolve, reject) => {
    try {
      // Cookies exported from the browser in Netscape cookie file format.
      // These are sent with our request to ensure we have access to logged in pages.
      const cookieStore = new FileCookieStore(cookieFile, { no_file_error: true })
      const jar = request.jar(cookieStore)
      resolve(jar)
    }
    catch (err) {
      reject(err)
    }
  })
)

/**
 * Loads cookies from the specified cookies.txt file (or the default file)
 * and loads them into a jar so that we can make requests with them.
 *
 * Cookies must be exported from the browser in Netscape cookie file format.
 * Without cookies, all requests will be logged out. This particularly affects Pixiv.
 */
export const loadCookies = async (file) => {
  // If passing a null value, just delete the jar and go back to logged out calls.
  if (!file) {
    cookieJar.jar = null
    return
  }
  const newJar = await loadCookieFile(file)
  cookieJar.jar = newJar
}

export default cookieJar
