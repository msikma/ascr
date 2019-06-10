/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import { fetchPixivSingle } from './scrape'
import { printPixivInfo } from './print'
import { downloadPixivImages } from './download'

// Single work URL.
const illustCheck = new RegExp('member_illust.+?illust_id=[0-9]+')

/**
 * Checks whether a URL is for a single work.
 */
const isPixivSingleURL = (url) => (
  illustCheck.test(url)
)

/**
 * Checks whether a URL is any kind of Pixiv link we can scrape.
 * Currently only single image links are supported.
 */
export const isPixivURL = (url) => {
  // Currently we only support single work links.
  if (isPixivSingleURL(url)) {
    return true
  }
}

/**
 * Parses any Pixiv link and returns information about the work.
 */
export const fetchPixivURL = async (url) => {
  if (isPixivSingleURL(url)) {
    return fetchPixivSingle(url)
  }
}

/**
 * Main entry point. Scrapes the Pixiv link, then prints its information,
 * then downloads the files.
 */
export const downloadPixivURL = async (url, name, author, subset, dirMin, authorDir, rawData, onlyData, type, quiet, overwrite) => {
  const info = await fetchPixivURL(url)

  // Print info if not in quiet mode.
  if (!quiet) printPixivInfo(info, rawData)

  // If we're only interested in the data, skip downloading the files.
  if (onlyData) return

  return downloadPixivImages(info, name, author, subset, dirMin, authorDir, type, overwrite)
}
