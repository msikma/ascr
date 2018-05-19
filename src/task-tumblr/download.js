/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import chalk from 'chalk'

import { progressBar } from '../util/tables'
import { makeDirectory } from '../util/files'
import { downloadAllFiles } from '../util/download'
import { imageName, getExtAndBase } from '../util/name'

const matchDashes = new RegExp('-', 'g')

/**
 * Attempt to safely get a filename. This is completely arbitrary,
 * but Tumblr doesn't make people enter a proper title for their works.
 * We try to see if the summary matches the slug, and use that if so.
 * Otherwise, we use the slug with its dashes turned into spaces.
 */
const getSafeName = (info) => {
  const spacedSlug = info.slug.replace(matchDashes, ' ')
  const firstSentenceSummary = info.summary.split('. ')[0]

  if (spacedSlug === firstSentenceSummary.toLowerCase()) {
    return firstSentenceSummary.trim()
  }
  else {
    return spacedSlug.trim()
  }
}

export const downloadTumblrImages = async (info, forceName, forceAuthor, subset, dirMin, authorDir, overwrite) => {
  const total = info.imageCount
  const name = forceName || getSafeName(info)
  const author = forceAuthor || info.blog.blogSub
  const firstURL = info.images[0].src[0]
  const baseExt = getExtAndBase(firstURL).ext
  const totalDl = subset.length > 0 ? subset.length : total
  const makeDir = dirMin !== 0 && dirMin <= total

  // If there are enough images, we store them in a directory. Create that directory now, if needed.
  const baseName = imageName(name, author, makeDir, authorDir, 1, total, baseExt)
  if (baseName.dirs.length) {
    await makeDirectory(baseName.dirs)
  }

  // Some posts have downloadable content by multiple people.
  // TODO: add this

  console.log('')
  console.log(`Downloading to ${chalk.red(baseName.full)}${total > 1 ? ` (${subset.length > 0 ? 'subset: ' : ''}${totalDl} image${totalDl > 1 ? 's' : ''})` : ''}...`)
  const progress = console.draft((progressBar(0, total)))
  const updateProgress = (a, z) => progress(progressBar(a, z))
  console.log('')

  // Hand info over to the generic file downloader.
  return downloadAllFiles(info, info.images, total, subset, name, author, makeDir, authorDir, null, updateProgress, overwrite)
}
