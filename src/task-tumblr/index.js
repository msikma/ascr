/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import { fetchTumblrSingle } from './scrape'
import { downloadTumblrImages } from './download'
import { printTumblrInfo } from './print'

// Single Tumblr post.
export const tumblrPostCheck = new RegExp('([^\\.]+)\\.tumblr\\.com/post/([0-9]+)(/([^/]+))?', 'i')

/**
 * Checks whether a URL is for a single Tumblr post.
 */
const isTumblrSingleURL = (url) => (
  tumblrPostCheck.test(url)
)

/**
 * Checks whether a URL is any kind of Tumblr link we can scrape.
 * Currently only single image links are supported.
 */
export const isTumblrURL = (url) => {
  // Currently we only support single work links.
  if (isTumblrSingleURL(url)) {
    return true
  }
}

/**
 * Parses any Tumblr link and returns information about the post.
 */
export const fetchTumblrURL = async (url, tumblrJSON) => {
  if (isTumblrSingleURL(url)) {
    return fetchTumblrSingle(url, tumblrJSON)
  }
}

/**
 * Main entry point. Scrapes the Tumblr link, then prints its information,
 * then downloads the files.
 */
export const downloadTumblrURL = async (url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, inline, overwrite, tumblrJSON) => {
  const info = await fetchTumblrURL(url, tumblrJSON)

  // Print info if not in quiet mode.
  if (!quiet) printTumblrInfo(info, rawData)

  // If we're only interested in the data, skip downloading the files.
  if (onlyData) return

  await downloadTumblrImages(info, name, author, subset, dirMin, authorDir, overwrite)
}
