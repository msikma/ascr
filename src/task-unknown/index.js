/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import { fetchGenericURL } from './scrape'
import { downloadGenericImages } from './download'
import { printGenericInfo } from './print'

export const downloadUnknownURL = async (url, name, author, subset, dirMin, authorDir, rawData, onlyData, quiet, overwrite) => {
  const info = await fetchGenericURL(url)

  if (info.imageCount === 0) return false

  // Print info if not in quiet mode.
  if (!quiet) printGenericInfo(info, rawData)

  // If we're only interested in the data, skip downloading the files.
  if (onlyData) return

  await downloadGenericImages(info, name, author, subset, dirMin, authorDir, overwrite)
}
