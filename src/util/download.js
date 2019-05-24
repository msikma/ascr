/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import fs from 'fs'
import chalk from 'chalk'

import cookieJar from './cookies'
import { downloadFileAsBrowser } from './request'
import { imageName, getExtAndBase, avoidDuplicates, swapExt } from './name'

// Prints a warning if a file already exists.
export const warnIfExists = (path, overwrite = false) => {
  if (fs.existsSync(path.full)) {
    console.log(`Warning: file ${chalk.red(path.fn)} exists. ${overwrite ? 'Overwriting.' : 'Adjusting filename.'}`)
  }
}

/**
 * Downloads a series of files. This is performed after all preparations have been completed and all we need
 * to do is pull in the files from the work.
 *
 * Returns a promise that resolves after all files are downloaded (or skipped, if they aren't in the subset).
 */
export const downloadAllFiles = (info, files, total, subset, name, author, makeDir, authorDir, makeHeaders, updateProgress, overwrite = false) => {
  let downloaded = 0
  let counter = 0
  const totalDl = subset.length > 0 ? subset.length : total
  
  return Promise.all(files.map((image, n) => {
    // Exit immediately if we're downloading a subset of images, and this one isn't in it.
    if (subset.length && subset.indexOf(n + 1) === -1) {
      return updateProgress(++counter, total)
    }
    // Otherwise, download as usual.
    const url = image.src ? image.src[0] : image

    // Some downloads might have a different author for a specific image in the list.
    // E.g. Tumblr posts that have downloadable replies from other people.
    const currAuthor = image.author
    const headers = makeHeaders ? makeHeaders(image.src[1]) : {}
    const ext = getExtAndBase(url).ext
    const path = imageName(name, currAuthor || author, makeDir, authorDir, ++downloaded, totalDl, ext)
    warnIfExists(path, overwrite)

    return new Promise(async (resolve) => {
      // If we're not overwriting existing files, run avoidDuplicates() to ensure the filename is unique.
      const fullPath = overwrite ? path.full : avoidDuplicates(path.full)
      // Our really big Pixiv hack.
      const mightBeURL = image.srcMightBe ? image.srcMightBe[0] : null
      const mightBeName = mightBeURL ? (overwrite ? swapExt(path.full) : avoidDuplicates(swapExt(path.full))) : null
      await downloadFileAsBrowser(url, fullPath, cookieJar.jar, headers, true, {}, mightBeURL, mightBeName)
      updateProgress(++counter, total)
      resolve(fullPath)
    })
  }))
}
