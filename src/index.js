/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import disableLogging from './util/log'
import { loadCookies } from './util/cookies'
import { subsetRange } from './util/subset'
import { downloadPixivURL, isPixivURL } from './task-pixiv'
import { downloadMandarakeURL, isMandarakeURL } from './task-mandarake'
import { downloadTwitterURL, isTwitterURL } from './task-twitter'
import { downloadTumblrURL, isTumblrURL } from './task-tumblr'
import { downloadUnknownURL } from './task-unknown'

/**
 * This is run right after parsing the user's command line arguments.
 * We check what type of URL the user passed and call the appropriate script.
 * This scrapes the page, prints info, and downloads the files.
 *
 * All command line arguments are passed here.
 */
export const run = async (args) => {
  const {
    urls, name, author, cookies, cookiesIsDefault, tumblrJSON, tumblrJSONIsDefault,
    dirMin, rawData, onlyData, type, inline, quiet, authorDir, noThread, overwrite
  } = args

  const subset = subsetRange(args.subset)

  // Prepare our cookies for usage in URL download requests.
  await loadCookies(cookies, cookiesIsDefault)

  // Completely silence all output if 'quiet' is 2.
  if (quiet === 2) {
    disableLogging()
  }

  try {
    for (const url of urls) {
      if (isPixivURL(url)) {
        await downloadPixivURL(url, name, author, subset, dirMin, authorDir, rawData, onlyData, type, quiet, overwrite)
      }
      else if (isTwitterURL(url)) {
        await downloadTwitterURL(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, noThread, overwrite)
      }
      else if (isTumblrURL(url)) {
        await downloadTumblrURL(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite, tumblrJSON, tumblrJSONIsDefault)
      }
      else if (isMandarakeURL(url)) {
        await downloadMandarakeURL(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite)
      }
      else {
        const success = await downloadUnknownURL(url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, overwrite)
        if (success) process.exit(0)
        console.log(`ascr: error: not a recognized URL scheme: ${url}`)
        process.exit(1)
      }
    }
  }
  catch (err) {
    if (err.statusCode === 404) {
      console.log(`ascr: error: given URL returned a page not found error (404)`)
    }
    else {
      // FIXME
      console.log(err)
      console.log(`ascr: error: ${err.statusCode}`)
    }
    process.exit(1)
  }
  return process.exit(0)
}
