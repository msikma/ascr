/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'
import he from 'he'
import { merge } from 'lodash'

import { pixivURLMode } from './scrape'
import { parsePixivMediumUntilMay2018 } from './medium-legacy'
import { findScriptData } from '../util/script'
import { htmlToTerm } from '../util/format'

/**
 * Returns the illustration ID for a URL.
 */
const pixivIllustID = (url) => {
  let matches = url.match(/illust_id=([0-9]+)/)
  if (matches == null) {
    // For URLs that are like 'https://www.pixiv.net/artworks/[0-9]+'
    matches = url.match(/artworks\/([0-9]+)$/)
  }
  return matches && parseInt(matches[1], 10)
}

/**
 * Returns the URL for the image on a single image page.
 */
const scrapePixivSingleImage = ($, url, isLoggedIn) => ({
  src: isLoggedIn
    ? [$('._illust_modal .wrapper img.original-image').attr('data-src'), url]
    : [$('.img-container img').attr('src'), url]
})

/**
 * Returns data for a Pixiv animation. This involves parsing a <script> tag and running it in a sandbox
 * to extract the variables declared there.
 */
const scrapePixivAnimation = ($, url) => {
  // Find all script tags, take their HTML values.
  const scripts = $('#wrapper script').map((n, tag) => $(tag).html()).get()
    // Keep only the one that has animation data.
    .filter(n => n.indexOf('ugokuIllustFullscreenData') > -1)

  // We should have one <script> tag that conforms to our search. If not, something is wrong.
  // Probably means the scraping code is outdated.
  if (scripts.length === 0) {
    throw new TypeError('Could not extract animation info from Pixiv animation page')
  }

  try {
    // Add a 'pixiv' object to the script code, since it assumes it has already been defined.
    const data = findScriptData(`pixiv={context:{}};${scripts[0]}`).sandbox.pixiv.context.ugokuIllustFullscreenData

    // If all went well, we should have the animation data.
    // The animation's source images are contained in a zip file, which are then to be either
    // saved verbatim (if --no-gif was passed), or merged into an animated gif using the frame delay data.
    // To download the zip file, we need the work's URL to be the referrer.
    return {
      src: [data.src, url],
      frames: data.frames,
      frameCount: data.frames.length,
      duration: data.frames.reduce((acc, frame) => acc + frame.delay, 0)
    }
  }
  catch (e) {
    throw new TypeError(`Could not extract animation info from Pixiv animation page: ${e}`)
  }
}

/**
 * Takes apart a Pixiv ?mode=medium page and extracts information.
 * Call with a Cheerio object, not a string of HTML data.
 *
 * We check whether we're logged in at this point as well.
 */
export const parsePixivMedium = ($, url) => {
  // Check if we're seeing an older version of the page.
  const versionUntilMay2018 = $('.works_display').length > 0

  if (versionUntilMay2018) {
    return parsePixivMediumUntilMay2018($, url)
  }

  // Check if this is an error page.
  const isError = $('.error-title').length > 0
  if (isError) return { isError }

  // Check to see if we're blocked from viewing this page due to being guest.
  const isBlocked = $('.r18-image .introduction-modal .title').length > 0
  if (isBlocked) return { isError: true, isBlocked }

  // No error, so scrape the page.
  // The new (post late May 2018) page has a convenient JS object full of all the information we need.
  // There's no actual HTML on the server side.
  const illustID = pixivIllustID(url)
  const bootstrapJS = $('script').get().map(s => $(s).html()).filter(s => s.indexOf('globalInitData') > -1)
  const bootstrapData = findScriptData(bootstrapJS).sandbox.globalInitData
  const illustData = bootstrapData.preload.illust[illustID]
  const userData = bootstrapData.preload.user[illustData.userId]
  
  // Now we just pick the data right out of the bootstrap object.
  const title = illustData.illustTitle
  const desc = htmlToTerm(illustData.illustComment, true)
  const dateCreation = illustData.createDate
  const dateUpload = illustData.uploadDate
  const likes = illustData.likeCount
  const views = illustData.viewCount
  const authorID = userData.userId
  const authorName = userData.name
  const imageCount = illustData.pageCount
  const hasMultipleImages = imageCount > 1
  const tags = illustData.tags.tags.map(t => `${t.tag}${t.translation && t.translation.en ? ` (${t.translation.en})` : ''}`)

  const isSFW = illustData.xRestrict === 0
  const isR18 = illustData.xRestrict === 1
  const isR18G = illustData.xRestrict === 2

  // Note:
  // * illustType 0 = single image
  // * illustType 1 = ?
  // * illustType 2 = animation
  const isAnimation = illustData.illustType === 2
  const isLoggedIn = !$('link[rel="stylesheet"][href*="pre-login.css"]').length

  const images = imageCount === 1 ? [{ src: [illustData.urls.original, pixivURLMode(url, 'manga')] }] : []

  return {
    id: illustID,
    title,
    desc,
    images,
    dateCreation,
    dateUpload,
    score: {
      views,
      likes
    },
    author: {
      authorID,
      authorName
    },
    images,
    imageCount,
    hasMultipleImages,
    tags,
    isSFW,
    isR18,
    isR18G,
    isAnimation,
    isLoggedIn
  }
}
