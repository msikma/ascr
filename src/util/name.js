/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import fs from 'fs'

import { safePath } from './files'

const nameSeparator = ' - '
const azSeparator = '-'

/** Returns a site domain name. */
export const getURLDomain = url => {
  const matches = url.match('\/\/(.+?)\/')
  if (matches && matches[1]) return matches[1]
  return null
}

/** Returns the page/directory name of a URL. */
export const getURLPage = url => {
  const lastSegment = url.split('/').pop()
  const page = lastSegment.match('[^.]+', 'i')
  if (page && page[0]) return page[0]
}

/**
 * When downloading multiple images from Pixiv, the largest size image might be
 * a JPG or it might be a PNG. The cheapest strategy is to try and download
 * the JPG first, and if it's a 404, download the PNG.
 */
export const swapExt = (url) => {
  const eb = getExtAndBase(url)
  if (eb.ext === 'jpg' || eb.ext === 'jpeg') {
    return `${eb.fn}.png`
  }
  else {
    return `${eb.fn}.jpg`
  }
}

/**
 * Returns a filename and directory name suggestion for files we download.
 * 'a' is the serial number for this image, and 'z' is the total number of images.
 * 'ext' is the file extension (e.g. 'jpg' or 'png'), without a period.
 *
 * This function returns an object containing a 'dirs' array and 'file' string.
 */
export const imageName = (name, author, makeDir, authorDir, a = 1, z = 1, ext) => {
  const file = [
    // If we're making a directory, and there is only one file, add 'image'.
    // This is a rare case, but otherwise we'll end up with a file called e.g. '.jpg'.
    ...(z === 1 && makeDir ? ['image'] : []),
    // If more than one image, add a-z.
    ...(z > 1 ? [` ${a}${azSeparator}${z}`] : []),
    // The file extension.
    `.${ext}`
  ]

  // We'll use the base either for the directory name, or for the filename
  // depending on whether we're putting the files in a directory or not.
  if (makeDir && !author) {
    const dirs = safePath([name])
    const fn = file.join('').trim()
    return { dirs, fn, full: `${dirs.join('/')}/${fn}` }
  }
  else if (!makeDir && !author) {
    const fn = [safePath([name]).join(nameSeparator), ...file].join('').trim()
    return { dirs: [], fn, full: fn }
  }
  else if (makeDir && authorDir) {
    const dirs = safePath([author, name])
    const fn = file.join('').trim()
    return { dirs, fn, full: `${dirs.join('/')}/${fn}` }
  }
  else if (makeDir && !authorDir) {
    const dirs = safePath([[name, author].join(nameSeparator).trim()])
    const fn = file.join('').trim()
    return { dirs, fn, full: `${dirs[0]}/${fn}` }
  }
  else {
    const fn = [safePath([name, author]).join(nameSeparator), ...file].join('').trim()
    return { dirs: [], fn, full: fn }
  }
}

/**
 * Splits a string by a separator, but only by the last occurrence of the separator.
 * The separators are kept. e.g. './.hidden/.dir/myfile.jpg' becomes ['./.hidden/.dir/myfile', '.jpg']
 */
const splitOnLast = (str, sep) => {
  const segments = str.split(sep)
  if (segments.length === 1) return segments
  const start = segments.slice(0, segments.length - 1)
  const end = segments.slice(-1)
  return [`${start.join('.')}`, `${sep}${end[0]}`]
}

/**
 * Retrieves the base path and extension of a filename. Removes :large, :orig, etc. on Twitter URLs if found.
 */
export const getExtAndBase = (path) => {
  const split = splitOnLast(path, '.')
  return { ext: split.pop().split(':').shift().slice(1), fn: split.shift() }
}

/**
 * Checks to see if this filename already exists. If so, it recommends a different filename.
 */
export const avoidDuplicates = (filename) => {
  const extBase = getExtAndBase(filename)
  let tries = 1
  let newName = filename
  while (true) {
    // Break if no file by that name can be found, meaning we can use it.
    if (!fs.existsSync(newName)) break
    // Just to ensure we don't get stuck.
    if (++tries > 2000) break

    // Add '2', '3', etc. after the base.
    newName = `${extBase.fn} ${tries}.${extBase.ext}`
  }
  return newName
}
