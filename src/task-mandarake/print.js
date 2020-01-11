/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import { topTable, mainTable } from '../util/tables'
import { shortenString } from '../util/format'

/**
 * Prints the basic image information we've scraped from Pixiv.
 * Contains e.g. the title of the work, the description, the author's name, etc.
 */
export const printMandarakeInfo = (info, printRawData) => {
  if (printRawData) {
    return console.log(info)
  }

  if (info.isError) {
    console.log('ascr: error: Mandarake returned an error page; possibly the item does not exist.')
    process.exit(1)
  }

  const metaData = {
    'Price': info.price,
    ...(info.bids ? { 'Bids': info.bids } : {}),
    'Images': info.imageCount,
    ...(info.timeLeft ? { 'Time left': info.timeLeft } : {})
  }
  
  const categories = info.categories ? info.categories.map(c => c[0]) : []

  const mainData = {
    'Title': shortenString(info.title, 300),
    'Description': shortenString(info.desc, 300),
    // Omit tags if the list is empty.
    ...(categories.length > 0 ? { 'Category': categories } : {})
  }

  console.log(topTable(metaData).toString())
  console.log(mainTable(mainData).toString())
}
