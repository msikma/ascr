/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import chalk from 'chalk'

import { progressBar } from '../util/tables'
import { makeDirectory } from '../util/files'
import { downloadAllFiles } from '../util/download'
import { imageName, getExtAndBase } from '../util/name'

export const downloadMandarakeImages = async (info, forceName, forceAuthor, subset, dirMin, overwrite) => {
  // If we're downloading multiple images, just print the name of the first one
  // as an example for how the rest will be named.
  const totalGet = subset.length ? subset.length : info.imageCount
  const name = forceName || info.title
  const baseExt = getExtAndBase(info.images[0]).ext
  const makeDir = dirMin !== 0 && dirMin <= totalGet

  // If there are enough images, we store them in a directory. Create that directory now, if needed.
  const baseName = imageName(name, null, makeDir, false, 1, totalGet, baseExt)
  if (baseName.dirs.length) {
    await makeDirectory(baseName.dirs)
  }
  console.log('')
  console.log(`Downloading to ${chalk.red(baseName.full)}${totalGet > 1 ? ` (${subset.length ? 'subset: ' : ''}${totalGet} image${totalGet > 1 ? 's' : ''}${subset.length ? ` of ${info.imageCount}` : ``})` : ''}...`)
  const progress = console.draft((progressBar(0, totalGet)))
  const updateProgress = (a, z) => progress(progressBar(a, z))
  console.log('')

  // Hand info over to the generic file downloader.
  return downloadAllFiles(info, info.images, info.imageCount, subset, name, null, makeDir, false, null, updateProgress, overwrite)
}
