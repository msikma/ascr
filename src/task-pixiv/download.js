/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import chalk from 'chalk'

import { convertToAnimation } from './animation'
import { progressBar } from '../util/tables'
import { makeDirectory } from '../util/files'
import { downloadAllFiles } from '../util/download'
import { imageName, getExtAndBase } from '../util/name'

/**
 * Returns the headers necessary to scrape images from multi-image Pixiv works.
 * Requires a referrer URL to be set.
 */
const pixivHeaders = (referrer) => ({
  'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
  'Cache-Control': 'no-cache',
  'Authority': 'i.pximg.net',
  ...(referrer ? { 'Referer': referrer } : {})
})

/**
 * Scrapes Pixiv images from an info object - this is data returned from e.g. fetchPixivSingle().
 * It's important that we send an appropriate 'Referer' header when grabbing these images,
 * or Pixiv will show a 403 forbidden.
 */
export const downloadPixivImages = async (info, forceName, forceAuthor, subset, dirMin, authorDir, type, overwrite) => {
  // If we're downloading multiple images, just print the name of the first one
  // as an example for how the rest will be named.
  const totalGet = subset.length ? subset.length : info.imageCount
  const name = forceName || info.title
  const author = forceAuthor || info.author.authorName
  const baseExt = getExtAndBase(info.images[0].src[0]).ext
  const makeDir = dirMin !== 0 && dirMin <= totalGet

  // If there are enough images, we store them in a directory. Create that directory now, if needed.
  const baseName = imageName(name, author, makeDir, authorDir, 1, totalGet, baseExt)
  if (baseName.dirs.length) {
    await makeDirectory(baseName.dirs)
  }
  // If we're downloading an animation, we'll either save it to .zip or make a .gif/.webm.
  // In all other cases, we just keep the same extension. Determine which one it is here.
  const makeAnimation = info.isAnimation && baseExt === 'zip' && type !== 'none'
  console.log('')
  console.log(`Downloading to ${chalk.red(baseName.full)}${totalGet > 1 ? ` (${subset.length ? 'subset: ' : ''}${totalGet} image${totalGet > 1 ? 's' : ''}${subset.length ? ` of ${info.imageCount}` : ``})` : ''}...`)
  const progress = console.draft((progressBar(0, totalGet)))
  const updateProgress = (a, z) => progress(progressBar(a, z))
  console.log('')

  // Hand info over to the generic file downloader.
  const files = await downloadAllFiles(info, info.images, info.imageCount, subset, name, author, makeDir, authorDir, pixivHeaders, updateProgress, overwrite)

  // If we're making an animation, hand the files over to the gif/webm generation code.
  if (makeAnimation) {
    return convertToAnimation(files, info.images, type)
  }
}
