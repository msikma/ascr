/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import tmp from 'tmp'
import fs from 'fs'
import { spawn } from 'child_process'
import filesize from 'filesize'

import { getExtAndBase, avoidDuplicates } from '../util/name'
import { copyFile, moveFile, writeFile, unzipFile, unlinkFile, makeDirectory } from '../util/files'

/**
 * Make temp directories and move/unzip all files there.
 * When we're done, everything there will be deleted, even if an error is raised.
 * Returns a number of filenames we'll need to finish processing gif/webm files.
 */
const unzipAnimationFile = async (file, type) => {
  const tmpDir = tmp.dirSync({ unsafeCleanup: true })
  const zipFile = `${tmpDir.name}/${file}`

  const zipDir = `${tmpDir.name}/zipcontent`
  const concatFile = `${zipDir}/concat.txt`
  const paletteFile = `${zipDir}/palette.png`
  const tmpDestFile = `${zipDir}/out.${type}`
  await makeDirectory(zipDir)
  await copyFile(file, zipFile)
  await unzipFile(zipFile, zipDir)

  return { zipDir, paletteFile, concatFile, tmpDestFile, tmpDir }
}

/**
 * Returns some necessary information for processing the animation files in ffmpeg,
 * regardless of whether we're using gif or webm.
 */
const getFilenameInfo = (file, n, images, type) => {
  // Check which file extension the image files have, and how many numbers the filenames have.
  const firstFile = images[n].frames[0].file.split('.')
  const ext = firstFile.pop()
  const fnl = firstFile.shift().length

  // Ensure we're not overwriting an existing file.
  const destFile = avoidDuplicates(`./${getExtAndBase(file).fn}.${type}`)

  return { ext, fnl, destFile }
}

/**
 * Spawns ffmpeg with the given arguments and returns a promise.
 * The promise resolves after ffmpeg finishes, and rejects if it exits with a non-zero exit code.
 */
const ffmpegSpawn = (args) => (
  new Promise((resolve, reject) => {
    const prc = spawn('ffmpeg', args)
    prc.on('error', (err) => reject(err))
    prc.on('close', (code) => (code === 0 ? resolve() : reject(code)))
  })
)

/**
 * Checks whether ffmpeg is installed and usable.
 */
const ffmpegCheck = () => (
  ffmpegSpawn(['-version'])
)

/**
 * Concat images to an animated gif using a palette and concat info file.
 * The basic command is: ffmpeg -y -f concat -safe 0 -i list.txt -i palette.png -lavfi paletteuse out.gif
 */
const makeGif = (concatFile, paletteFile, destFile) => (
  ffmpegSpawn(['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-i', paletteFile, '-lavfi', 'paletteuse=dither=floyd_steinberg:bayer_scale=3', destFile])
)

/**
 * Concat images to a webm file using the concat demuxer.
 * The basic command is: ffmpeg -y -f concat -safe 0 -i list.txt -c:v libvpx -crf 12 -b:v 500K out.webm
 */
const makeWebm = (concatFile, destFile, crf = '4', bitrate = '1M') => (
  ffmpegSpawn(['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-c:v', 'libvpx', '-crf', crf, '-b:v', bitrate, destFile])
)

/**
 * Uses ffmpeg to make a gif palette for our animation.
 * This significantly enhances the quality of the file.
 * The basic command is: ffmpeg -y -i "%06d.jpg" -vf palettegen palette.png
 */
const makePalette = (zipDir, fnl, ext, paletteFile) => (
  // Pad filename length with a leading zero.
  ffmpegSpawn(['-y', '-i', `${zipDir}/%${fnl < 10 ? `0${fnl}` : fnl}d.${ext}`, '-vf', 'palettegen=reserve_transparent=1:stats_mode=diff', paletteFile])
)

/**
 * Generates a concat text with filenames and durations is used for making gif/webm files.
 * The content contains two lines for each frame: the filename, and then the duration in seconds.
 * This file should be saved and then passed to the ffmpeg concat filter.
 */
const createConcatInfo = (frameInfo) => (
  frameInfo
    .map(frame => `file '${frame.file}'\nduration ${frame.delay / 1000}`)
    .join('\n')
)

/**
 * Used after conversion is complete. Prints 'done' and the file size of the generated file.
 */
const reportFileSize = (file) => {
  const fsize = filesize(fs.statSync(file).size, { base: 10, round: 1, standard: 'iec' })
  console.log(`Done. File size: ${fsize}.`)
}

/**
 * Converts a Pixiv animation to gif.
 *
 * This utilizes ffmpeg to do most of the work: first, all images are analyzed and
 * a palette is generated. Then, the gif itself is made based on that palette
 * and the frame information we scraped earlier.
 *
 * The frames of a Pixiv animation all have a custom duration in ms, which means we
 * need to copy these into a format usable by the 'concat' demuxer.
 */
const convertToGif = async (file, n, images) => {
  console.log(`Converting file ${file} to animated gif...`)

  // Extract base name, extension and a destination filename.
  const { ext, fnl, destFile } = getFilenameInfo(file, n, images, 'gif')

  // An array of frame information objects, e.g. [{ file: '00000.jpg', delay: 120 }, ...] etc.
  const frameInfoText = createConcatInfo(images[n].frames)

  // Unzip the original zip file and make a temp output file for our gif.
  const { zipDir, paletteFile, concatFile, tmpDestFile, tmpDir } = await unzipAnimationFile(file, 'gif')
  await writeFile(concatFile, frameInfoText)

  // All the pieces are in place. Now we first generate the gif palette, and then the gif itself.
  await makePalette(zipDir, fnl, ext, paletteFile)
  await makeGif(concatFile, paletteFile, tmpDestFile)

  // We're done. Move the temp filename, 'out.gif', to its final destination. Delete the original .zip.
  await moveFile(tmpDestFile, destFile)
  await unlinkFile(file)
  reportFileSize(destFile)

  // Ensure removal of the temp directory.
  tmpDir.removeCallback()
}

/**
 * Converts a Pixiv animation to webm.
 *
 * More or less the same as convertToGif(), except that we use a different extension
 * and pass different options to ffmpeg. See the comments in convertToGif()
 * to get an understanding of what's happening here.
 */
const convertToWebm = async (file, n, images) => {
  console.log(`Converting file ${file} to webm...`)

  const { destFile } = getFilenameInfo(file, n, images, 'webm')
  const frameInfoText = createConcatInfo(images[n].frames)
  const { concatFile, tmpDestFile, tmpDir } = await unzipAnimationFile(file, 'webm')
  await writeFile(concatFile, frameInfoText)
  await makeWebm(concatFile, tmpDestFile)
  await moveFile(tmpDestFile, destFile)
  await unlinkFile(file)
  reportFileSize(destFile)
  tmpDir.removeCallback()
}

/**
 * Converts a Pixiv animation to either gif or webm format.
 * In both cases we use ffmpeg to do the work.
 * See convertToGif() and convertToWebm() for more detailed information.
 */
export const convertToAnimation = async (files, images, type = 'webm') => {
  // Keep the .zip file if animation type is 'none'.
  if (type === 'none') {
    return
  }
  try {
    // Check if ffmpeg is available and usable.
    await ffmpegCheck()
  }
  catch (e) {
    // If not, there's not much we can do.
    console.log('Tried to make an animated gif, but ffmpeg is not available.')
    console.log('See the documentation for how to install ffmpeg on your computer.')
    return
  }

  // 'files' is an array, but in reality it always contains one item,
  // unless Pixiv starts allowing multiple animations per work in the future.
  switch (type) {
    case 'gif': return Promise.all(files.map((file, n) => convertToGif(file, n, images)))
    case 'webm': return Promise.all(files.map((file, n) => convertToWebm(file, n, images)))
    default:
      console.log('Unknown animation format specified.')
      break
  }
}
