/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import chalk from 'chalk'

import { progressBar } from '../util/tables'
import { makeDirectory } from '../util/files'
import { downloadAllFiles } from '../util/download'
import { imageName, getExtAndBase } from '../util/name'

export const downloadGenericImages = async (info, forceName, forceAuthor, subset, dirMin, authorDir, overwrite) => {
  const images = info.images
  const totalGet = subset.length ? subset.length : images.length
  const name = forceName || info.title ? `${info.title} (${info.page})` : info.page
  const author = forceAuthor || info.domain
  const firstURL = images[0].src[0]
  const baseExt = getExtAndBase(firstURL).ext
  const makeDir = dirMin !== 0 && dirMin <= totalGet

  // If there are enough images, we store them in a directory. Create that directory now, if needed.
  const baseName = imageName(name, author, makeDir, authorDir, 1, totalGet, baseExt)
  if (baseName.dirs.length) {
    await makeDirectory(baseName.dirs)
  }

  console.log('')
  console.log(`Downloading to ${chalk.red(baseName.full)}${totalGet > 1 ? ` (${subset.length > 0 ? 'subset: ' : ''}${totalGet} image${totalGet > 1 ? 's' : ''}${subset.length ? ` of ${info.imageCount}` : ``})` : ''}...`)
  const progress = console.draft((progressBar(0, totalGet)))
  const updateProgress = (a, z) => progress(progressBar(a, z))

  // Hand info over to the generic file downloader.
  return downloadAllFiles(null, images, totalGet, subset, name, author, makeDir, authorDir, null, updateProgress, overwrite)
}
