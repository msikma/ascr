/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'
import he from 'he'
import { merge, get } from 'lodash'

import { parsePixivMedium } from './medium'
import { getExtAndBase, swapExt } from '../util/name'
import { findScriptData } from '../util/script'
import { requestURL } from '../util/request'

/**
 * Switch a URL between different view modes (e.g. 'manga', 'medium').
 */
export const pixivURLMode = (url, type = 'medium') => {
  return url.replace(/(member_illust\.php\?mode=)(.+?)(&)/, `$1${type}$3`)
}

/**
 * Returns a URL for making a JSON request for the images of a work.
 */
export const pixivAjaxURL = (id) => (
  `https://www.pixiv.net/ajax/illust/${id}/pages`
)

/**
 * Returns the URL for a big image link inside of a manga page.
 * These URLs are needed when scraping the images, since they will return 403 forbidden
 * unless this URL is set as its referer.
 */
const pixivMangaBigLink = (id, n) => (
  `https://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=${id}&page=${n}`
)

/**
 * Returns a full URL for an author's top page from their ID.
 */
const pixivAuthorFromID = (id) => (
  `https://www.pixiv.net/member.php?id=${id}`
)

/**
 * Turns a Pixiv image link into its original, high resolution version.
 */
const pixivImgToOriginal = (url) => (
  url.replace(/(pximg\.net)(.+)?(img-)([^/]+)(.+)(_master[0-9]+)/, '$1$2$3original$5')
)

/**
 * Used by parsePixivAuthor(). This is used to extract info from the profile tables.
 */
const filterTDs = ($, $tds, text) => {
  return $tds.filter((n, td) => $(td).text() === text)
}

/**
 * Returns the user's age if it is set, or null.
 */
const filterAge = (ageText) => {
  if (!ageText) {
    return null
  }
  const matches = ageText.match(/([0-9]+)/)
  if (matches[1]) {
    return Number(matches[1])
  }
  return null
}

/**
 * Pad a single zero in front of a number if it is one number long.
 */
const padZero = (str) => {
  if (str.length === 1) {
    return `0${str}`
  }
  return str
}

/**
 * Extracts a timestamp from a Japanese date string.
 */
const filterBday = (bdayText) => {
  if (!bdayText) {
    return null
  }
  const matches = bdayText.match(/([0-9]+)月([0-9]+)日/)
  if (matches[1] && matches[2]) {
    return `${padZero(matches[1])}-${padZero(matches[2])}`
  }
  return null
}

/**
 * Returns what user input for gender. Pixiv only supports male/female at this time.
 */
const filterGender = (genderText) => {
  switch (genderText) {
    case '男性': return 'm'
    case '女性': return 'f'
    default: return null
  }
}

/**
 * Scrapse a Pixiv member page and extracts information. We only extract profile information,
 * not work environment information. Every piece of information that isn't found is returned as null.
 * Call with a Cheerio object, not a string of HTML data.
 */
const parsePixivAuthor = ($) => {
  const $tables = $('.worksListOthers .ws_table.profile')
  const $profileTable = $($tables[0])
  const $tds = $('.td1', $profileTable)

  // Default these to null (instead of an empty string) if they do not exist.
  const twitter = $('a[href*="jump.php?https%3A%2F%2Ftwitter.com"]', $profileTable).text().trim() || null
  const homepage = filterTDs($, $tds, 'HPアドレス').next().text().trim() || null
  // Note, Pixiv supports using linebreaks in the bio field, but no other HTML.
  // We convert to HTML, then manually replace <br> tags.
  // Since the HTML is encoded using numerical character references (e.g. &#x30B9; = ス) we decode it here as well.
  const bioRaw = filterTDs($, $tds, '自己紹介').next().html()
  const bio = bioRaw ? he.decode(bioRaw.replace(/<br\s*\/?>/ig, '\n')) : null

  const gender = filterGender(filterTDs($, $tds, '性別').next().text().trim())
  const address = filterTDs($, $tds, '住所').next().text().trim() || null
  const age = filterAge(filterTDs($, $tds, '年齢').next().text().trim())
  const bday = filterBday(filterTDs($, $tds, '誕生日').next().text().trim())
  const occupation = filterTDs($, $tds, '職業').next().text().trim() || null

  return {
    twitter,
    bio,
    homepage,
    gender,
    address,
    age,
    bday,
    occupation
  }
}

/**
 * Parses a Pixiv manga page to extract its image links.
 * Returns an array of images. Requires the original URL for extracting the ID.
 *
 * This code works for both LTR and RTL manga pages, which are completely different.
 * For the LTR page we fish the images out of the HTML. For RTL, we extract them
 * from a series of <script> tags.
 */
const parsePixivManga = ($, url) => {
  // Verify whether this is an RTL manga page or not.
  const isRTL = $('html').hasClass('_book-viewer', 'rtl')
  if (isRTL) {
    // Retrieve information about the images from the Javascript data.
    const scripts = $('script').map((n, tag) => $(tag).html()).get()
      // Keep only the ones that have image data.
      .filter(n => n.indexOf('pixiv.context.images[') > -1)

    // We should have at least one <script> tag. One per image.
    if (scripts.length === 0) {
      throw new TypeError('Could not extract image info from Pixiv manga page')
    }

    try {
      // Pick up all the images from the <script> tags.
      const imageData = scripts.reduce((acc, scr) => {
        // Set up a 'pixiv' object with the structure that the <script> tag expects.
        const scriptData = findScriptData(`
          pixiv = {
            context: {
              images: [],
              thumbnailImages: [],
              originalImages: []
            }
          };
          ${scr}
        `)
        return merge(acc, scriptData.sandbox)
      }, {})

      // Now all we need to do is add the current URL as referrer.
      const originalImages = imageData.pixiv.context.originalImages.map(img => ({ src: [img, url] }))
      return originalImages
    }
    catch (e) {
      throw new TypeError(`Could not extract image info from Pixiv manga page: ${e}`)
    }
  }

  // On regular manga pages, it's a bit more straightforward.
  // Extract the ID from the URL.
  const id = url.match(/illust_id=([0-9]+)/)[1]
  const $containers = $('.item-container img.image')
  // Very confusing. jQuery's map() has the counter first. Regular map() has it after.
  const masterImages = $containers.map((n, img) => $(img).attr('data-src').trim()).get()
  const originalImages = masterImages.map((img, n) => ({
    srcMightBe: [swapExt(pixivImgToOriginal(img)), pixivMangaBigLink(id, n)],
    src: [pixivImgToOriginal(img), pixivMangaBigLink(id, n)]
  }))

  return originalImages
}

/**
 * Extracts images from Pixiv JSON requests.
 */
const fetchPixivImageJSON = async (id, referrer) => {
  const url = pixivAjaxURL(id)
  const res = await requestURL(url)
  const data = JSON.parse(res)
  const images = get(data, 'body', [])
  return images.map(img => ({ src: [img.urls.original, referrer] }));
}

/**
 * Loads HTML for a Pixiv multiple images page (the 'manga' page)
 * and returns its images.
 */
const fetchPixivManga = async (mangaURL) => {
  const html = await requestURL(mangaURL)
  const $mangaHTML = cheerio.load(html)
  return parsePixivManga($mangaHTML, mangaURL)
}

/**
 * Loads HTML for a Pixiv author and returns information parsed from the page.
 */
const fetchPixivAuthor = async (authorURL) => {
  const $authorHTML = cheerio.load(await requestURL(authorURL))
  return parsePixivAuthor($authorHTML)
}

/**
 * Extracts all information from a single Pixiv image page, including author information and image links.
 * We potentially need to fetch two additional pages to complete the work: the author's top page (to get
 * their profile information), and the work's 'see more' page (the 'manga' page, on works with multiple images).
 * This could potentially take some time.
 * 
 * Pixiv recently removed their 'manga' pages (separate pages that contain all the images), in favor
 * of loading the images with JSON and adding them to the main illustration page.
 * It's still possible to load the 'manga' pages if they ever come back (they were AB testing it earlier)
 * but for now 'useJSONRequest' is true by default, which loads the JSON request.
 */
export const fetchPixivSingle = async (rawURL, includeAuthorInfo = true, useJSONRequest = true) => {
  // Ensure we're loading the ?mode=medium page.
  const url = pixivURLMode(rawURL, 'medium')
  const html = await requestURL(url)
  const $mediumHTML = cheerio.load(html)
  const mediumInfo = parsePixivMedium($mediumHTML, url)

  // Return early if this is an error page.
  if (mediumInfo.isError) return mediumInfo

  // If there's only one image, it was on the medium page and we already have it.
  // If there are multiple images, we need to load the image detail page and scrape it.
  // Since we're also loading the author page, we'll load these in parallel.
  // If we're not logged in, we don't know how many images there are yet.
  const tasks = []
  if (mediumInfo.hasMultipleImages) {
    // Fetch HTML for the manga page and return the image links.
    if (useJSONRequest) {
      tasks.push(fetchPixivImageJSON(mediumInfo.id, url))
    }
    else {
      tasks.push(fetchPixivManga(pixivURLMode(url, 'manga')))
    }
  }
  if (includeAuthorInfo) {
    // Fetch the author's top page for their profile information.
    tasks.push(fetchPixivAuthor(pixivAuthorFromID(mediumInfo.author.authorID)))
  }

  // After we fetch the rest of the data, merge it all together.
  const info = await Promise.all(tasks)
  const data = { ...mediumInfo, author: { ...mediumInfo.author } }
  if (mediumInfo.hasMultipleImages) {
    data.images = [...data.images, ...info[0]]
  }
  if (includeAuthorInfo) {
    data.author = { ...data.author, ...info[info.length - 1] }
  }

  // In case we are not logged in, we weren't able to get the image count earlier.
  return { ...data, imageCount: data.images.length }
}
