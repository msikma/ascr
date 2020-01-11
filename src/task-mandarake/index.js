/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import { fetchEkizoSingle, fetchShopSingle } from './scrape'
import { printMandarakeInfo } from './print'
import { downloadMandarakeImages } from './download'

/**
 * Checks whether a URL is for an auction page.
 */
const isMandarakeAuctionURL = (url) => (
  /\/\/ekizo\.mandarake\.co\.jp\/auction\/item\/itemInfo.+?index=[0-9]+$/.test(url)
)

/**
 * Checks whether a URL is for an auction page.
 */
const isMandarakeShopURL = (url) => (
  /\/\/order\.mandarake\.co\.jp\/order\/detailPage\/item.+?itemCode=[0-9]+/.test(url)
)

/**
 * Checks whether a URL is any kind of Mandarake link we can scrape.
 * Currently only auction links are supported.
 */
export const isMandarakeURL = (url) => {
  return isMandarakeAuctionURL(url) || isMandarakeShopURL(url)
}

/**
 * Parses any Pixiv link and returns information about the work.
 */
export const fetchMandarakeURL = async (url) => {
  if (isMandarakeAuctionURL(url)) {
    return fetchEkizoSingle(url)
  }
  if (isMandarakeShopURL(url)) {
    return fetchShopSingle(url)
  }
}

/**
 * Main entry point. Scrapes the Pixiv link, then prints its information,
 * then downloads the files.
 */
export const downloadMandarakeURL = async (url, name, author, subset, dirMin, authorDir, rawData, onlyData, type, quiet, overwrite) => {
  const info = await fetchMandarakeURL(url)

  // Print info if not in quiet mode.
  if (!quiet) printMandarakeInfo(info, rawData)

  // If we're only interested in the data, skip downloading the files.
  if (onlyData) return

  await downloadMandarakeImages(info, name, author, subset, dirMin, overwrite)
}
