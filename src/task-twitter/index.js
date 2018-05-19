/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import { fetchTwitterSingle } from './scrape'
import { downloadTwitterImages } from './download'
import { printTwitterInfo } from './print'

// Single tweet URL.
export const tweetCheck = new RegExp('twitter\\.com/([^/]+)/status/([0-9]+)', 'i')

/**
 * Checks whether a URL is for a single tweet.
 */
const isTwitterSingleURL = (url) => (
  tweetCheck.test(url)
)

/**
 * Checks whether a URL is any kind of Twitter link we can scrape.
 * Currently only single image links are supported.
 */
export const isTwitterURL = (url) => {
  // Currently we only support single work links.
  if (isTwitterSingleURL(url)) {
    return true
  }
}

/**
 * Parses any Twitter link and returns information about the tweet.
 */
export const fetchTwitterURL = async (url, noThread = false) => {
  if (isTwitterSingleURL(url)) {
    return fetchTwitterSingle(url, noThread)
  }
}

/**
 * Main entry point. Scrapes the Twitter link, then prints its information,
 * then downloads the files.
 *
 * If 'noThread' is true, we'll download images from only the original tweet instead of the author's self-thread.
 */
export const downloadTwitterURL = async (url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, noThread, overwrite) => {
  const info = await fetchTwitterURL(url, noThread)

  // Print info if not in quiet mode.
  if (!quiet) printTwitterInfo(info, rawData)

  // If we're only interested in the data, skip downloading the files.
  if (onlyData) return

  await downloadTwitterImages(info, name, author, subset, dirMin, authorDir, overwrite)
}
