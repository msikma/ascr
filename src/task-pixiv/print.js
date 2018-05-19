/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import chalk from 'chalk'

import { topTable, mainTable } from '../util/tables'
import { shortenString } from '../util/format'

/**
 * Returns a string representation of the work's rating.
 */
const getRating = (info) => {
  if (info.isSFW) return 'SFW'
  if (info.isR18) return chalk.red('R-18')
  if (info.isR18G) return chalk.red('R-18G')
}

/**
 * Prints the basic image information we've scraped from Pixiv.
 * Contains e.g. the title of the work, the description, the author's name, etc.
 */
export const printPixivInfo = (info, printRawData) => {
  if (printRawData) {
    return console.log(info)
  }

  if (info.isError) {
    console.log('ascr: error: Pixiv returned an error page; possibly the illustration does not exist or is private')
    process.exit(1)
  }
  if (!info.isLoggedIn && !info.isSFW) {
    console.log('ascr: error: cannot download non-SFW images from Pixiv without being logged in')
    process.exit(1)
  }

  const metaData = {
    'Views': info.score.views,
    'Likes': info.score.likes,
    'Images': info.imageCount,
    'Rating': getRating(info)
  }

  const mainData = {
    'Title': shortenString(info.title, 300),
    'Description': shortenString(info.desc, 300),
    'Author': shortenString(info.author.authorName, 50),
    // Omit tags if the list is empty.
    ...(info.tags.length > 0 ? { 'Tags': info.tags } : {})
  }

  // If we're not logged in, print a warning banner.
  const warning = !info.isLoggedIn ? `Warning: not logged in to Pixiv. Can't download high resolution files.\nSee readme.md for help on logging in.` : null

  console.log(topTable(metaData, warning).toString())
  console.log(mainTable(mainData).toString())
}
