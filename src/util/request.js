/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import fs from 'fs'
import request from 'request'
import fetch from 'node-fetch'

import { getExtAndBase } from './name'
import cookieJar from './cookies'

// Headers similar to what a regular browser would send.
export const browserHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
}

// Default settings for requests.
const requestDefaults = {
  gzip: true
}

/**
 * Starts downloading a file to a path, and returns a promise that resolves
 * after the file has been fully saved. A pipe is used to write the file,
 * meaning that the file will be gradually filled with data, and on premature exit
 * the file will have partial data.
 *
 * mightBe: Special hack for Pixiv: a file might be a jpg, or it might be a png.
 * This is the least expensive way to check when downloading a lot of files.
 */
export const downloadFileAsBrowser = (url, name, useCookieJar = cookieJar.jar, extraHeaders = {}, gzip = true, reqOverrides = {}, mightBeURL = null, mightBeName = null) => (
  new Promise(async (resolve, reject) => {
    const args = { headers: { ...browserHeaders, ...extraHeaders }, jar: useCookieJar, gzip, ...reqOverrides }
    try {
      const r = await pipeFile({ ...args, url }, name)
      resolve({ ...r })
    }
    catch (err) {
      console.log(err)
      fs.unlinkSync(name)
      try {
        const rTwo = await pipeFile({ ...args, url: mightBeURL }, mightBeName)
        return resolve({ ...rTwo })
      }
      catch (errTwo) {
      }
      return reject(err)
    }
  })
)

/**
 * Pipe a download to a file on the local disk.
 */
const pipeFile = (args, name) => (
  new Promise((resolve, reject) => {
    request.get({ ...args, resolveWithFullResponse: true, encoding: null }, () => {})
      .on('complete', async (res, body) => {
        const headers = new fetch.Headers(res.headers)
        const type = headers.get('Content-Type').toLowerCase()
        if (res.statusCode === 404) {
          return reject()
        }
        // Hack: sometimes jpg files are actually webp files.
        let finalName = name
        if (type === 'image/webp') {
          const { fn } = getExtAndBase(name)
          finalName = `${fn}.webp`
        }
        try {
          await saveBinaryFile(body, finalName)
          return resolve()
        }
        catch (err) {
          return reject()
        }
      })
  })
)

/**
 * Saves binary data to a destination file.
 */
const saveBinaryFile = (data, dest) => (
  new Promise((resolve, reject) => {
    fs.writeFile(dest, data, { encoding: null }, (err) => {
      if (err) return reject()
      return resolve()
    })
  })
)

// Requests a URI using our specified browser headers as defaults.
// This function has a higher chance of being permitted by the source site
// since it's designed to look like a normal browser request rather than a script.
// The request() function returns a promise, so remember to await.
export const requestURL = (url, fullResponse = false, headers = {}, etc = {}, useCookieJar = cookieJar.jar) => new Promise((resolve, reject) => (
  request(
    { url: encodeURI(url), headers: { ...browserHeaders, ...(headers != null ? headers : {}) }, ...requestDefaults, ...etc, ...(useCookieJar ? { jar: useCookieJar } : {}) },
    (err, res, body) => {
      if (err) return reject(err)
      resolve(fullResponse ? res : body)
    }
  )
))
