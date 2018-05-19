/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import fs from 'fs'
import unzip from 'unzip'
import mkdirp from 'mkdirp'
import sanitize from 'sanitize-filename'

import { isArray } from './isArray'

/**
 * Copies a file from one location to another. Uses a promise.
 */
export const copyFile = (src, dest) => (
  new Promise((resolve) => {
    const rd = fs.createReadStream(src)
    const wr = fs.createWriteStream(dest)
    wr.on('close', () => resolve())
    rd.pipe(wr)
  })
)

/**
 * Replaces unsafe filename characters with dashes.
 * Paths with e.g. slashes or colons in them can cause problems.
 */
export const safePath = (dirsArray) => (
  dirsArray.map(d => sanitize(String(d), { replacement: '-' }))
)

/**
 * Makes a directory. Returns a promise that resolves once the directory has been made.
 */
export const makeDirectory = (dirs) => (
  new Promise((resolve, reject) => {
    // Wrap in an array if it isn't already.
    const dirsArray = isArray(dirs) ? dirs : dirs.split('/')
    const path = safePath(dirsArray).join('/')
    mkdirp(path, (err) => (err ? reject() : resolve(path)))
  })
)

/**
 * Saves a file to a specific path. Uses a promise.
 */
export const writeFile = (path, content) => (
  new Promise((resolve, reject) => {
    fs.writeFile(path, content, 'utf8', (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
)

/**
 * Unzips a file to a destination directory. Uses a promise.
 */
export const unzipFile = (src, dest) => (
  new Promise((resolve) => {
    fs.createReadStream(src)
      .pipe(unzip.Extract({ path: dest }))
      .on('close', () => {
        resolve()
      })
  })
)

/**
 * Unlinks a file. Uses a promise.
 */
export const unlinkFile = (path) => (
  new Promise((resolve, reject) => {
    fs.unlink(path, (err) => (err ? reject(err) : resolve()))
  })
)

// Steal moveFile from npm.
export { default as moveFile } from 'move-file'
