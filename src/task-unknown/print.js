/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import { shortenString } from '../util/format'
import { topTable, mainTable } from '../util/tables'

export const printGenericInfo = (info, printRawData) => {
  if (printRawData) {
    return console.log(info)
  }

  const metaData = {
    'Site': info.domain,
    'Title': info.title
  }

  const mainData = {
    'URL': shortenString(info.url, 52, true),
    'Images': String(info.imageCount),
    'Language': info.lang
  }

  console.log(topTable(metaData).toString())
  console.log(mainTable(mainData).toString())
}
