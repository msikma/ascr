/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import chalk from 'chalk'

import { progressBar } from '../util/tables'
import { makeDirectory } from '../util/files'
import { downloadAllFiles } from '../util/download'
import { imageName, getExtAndBase } from '../util/name'

/**
 * Downloads images scraped from the given Twitter URL.
 * If there are replies by the author with images, these get downloaded as well.
 */
export const downloadTwitterImages = async (tweetsInfo, forceName, forceAuthor, subset, dirMin, authorDir, overwrite) => {
  const totalImages = tweetsInfo.reduce((n, tweet) => n + tweet.images.length, 0)
  const mainTweet = tweetsInfo.filter(t => t.isMainTweet === true)[0]
  const allFiles = tweetsInfo.reduce((acc, tweet) => [...acc, ...tweet.images], [])

  const total = totalImages
  const name = forceName || mainTweet.tweet.tweetID
  const author = forceAuthor || mainTweet.author.authorName
  const firstURL = mainTweet.images[0].src[0]
  const baseExt = getExtAndBase(firstURL).ext
  const totalDl = subset.length > 0 ? subset.length : total
  const makeDir = dirMin !== 0 && dirMin <= total

  // If there are enough images, we store them in a directory. Create that directory now, if needed.
  const baseName = imageName(name, author, makeDir, authorDir, 1, total, baseExt)
  if (baseName.dirs.length) {
    await makeDirectory(baseName.dirs)
  }

  console.log('')
  console.log(`Downloading to ${chalk.red(baseName.full)}${total > 1 ? ` (${subset.length > 0 ? 'subset: ' : ''}${totalDl} image${totalDl > 1 ? 's' : ''})` : ''}...`)
  const progress = console.draft((progressBar(0, total)))
  const updateProgress = (a, z) => progress(progressBar(a, z))

  // Hand info over to the generic file downloader.
  return downloadAllFiles(tweetsInfo, allFiles, total, subset, name, author, makeDir, authorDir, null, updateProgress, overwrite)
}
