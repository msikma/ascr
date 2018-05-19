/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import he from 'he'

import { findScriptData } from '../util/script'
import { requestURL } from '../util/request'

// Used to switch a URL between different view modes (e.g. 'manga', 'medium').
const illustMode = new RegExp('(member_illust\\.php\\?mode=)(.+?)(&)')
// Extracts the ID from the URL.
const illustID = new RegExp('illust_id=([0-9]+)')

// Used to convert smaller/thumbnail image links into their original version.
// Use with imgReplace.
const imgType = new RegExp('(pximg\\.net)(.+)?(img-)([^/]+)(.+)(_master[0-9]+)')
const imgReplace = '$1$2$3original$5'

// Used to extract various information from a member's top page.
const memberID = new RegExp('member\\.php\\?.*id=([0-9]+)')
const memberAge = new RegExp('([0-9]+)')
const memberBday = new RegExp('([0-9]+)月([0-9]+)日')
const bioBr = new RegExp('<br\\s*/?>', 'ig')

/**
 * Turns a Pixiv URL into one we can more easily scrape.
 */
const pixivURLMode = (url, type = 'medium') => {
  return url.replace(illustMode, `$1${type}$3`)
}

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
  url.replace(imgType, imgReplace)
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
  const matches = ageText.match(memberAge)
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
  const matches = bdayText.match(memberBday)
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
const parsePixivMedium = ($, url) => {
  // Check if we're logged in. If we aren't, we cannot get original size images.
  const isLoggedIn = !$('link[rel="stylesheet"][href*="pre-login.css"]').length

  // Check if this is an error page.
  const isError = $('.error-title').length > 0
  if (isError) return { isError, isLoggedIn }

  // No error, so scrape the page.
  const $info = isLoggedIn ? $('.work-info') : $('.cool-work')
  const $work = $('.works_display')
  const $author = isLoggedIn ? $('._user-profile-card .profile') : $('.userdata-row')

  const title = $('h1.title', $info).text().trim()
  const desc = $(isLoggedIn ? '.ui-expander-container p.caption' : '#caption_long', $info).text().trim()
  const views = Number($(isLoggedIn ? '.user-reaction .view-count' : '.cool-work-sub li.info:first-child .views', $info).text().trim())
  const likes = Number($(isLoggedIn ? '.user-reaction .rated-count' : '.cool-work-sub li.info:last-child .views', $info).text().trim())
  const isR18 = isLoggedIn ? $('.meta .r-18', $info).length > 0 : $('.breadcrumb a[href*="R-18"]').length > 0
  const isR18G = isLoggedIn ? $('.meta .r-18g', $info).length > 0 : $('.breadcrumb a[href*="R-18G"]').length > 0
  const isAnimation = $('._ugoku-illust-player-container', $work).length > 0
  const tags = $(isLoggedIn ? '.tags .tag a.text' : '#tag_area .tag a.text').map((n, tag) => $(tag).text().trim()).get()
  const authorName = $(isLoggedIn ? '.user-name' : 'a', $author).text().trim()

  // When retrieving the author ID, it matters if we are logged in or not.
  // If not logged in, the ID can be found elsewhere. First, try the logged in version.
  const authorIDLI = $('.column-header .tabs a[href*="member.php?"]').attr('href')
  const authorIDRaw = authorIDLI ? authorIDLI : $('.userdata-row .name a[href*="member.php?"]').attr('href')
  const authorID = Number(authorIDRaw.match(memberID)[1])

  // Note: when logged in, if this node doesn't exist, it's a single image page.
  // When NOT logged in, we don't know how many images there are. Save 'null' and figure it out later.
  const imageCount = isLoggedIn ? (Number($('.page-count span', $work).text().trim()) || 1) : null
  // If we're not logged in, run a check to see if there are multiple images at all
  // (there should be a link). That way we know to request and parse the manga page.
  const hasMultipleImages = isLoggedIn ? imageCount > 1 : $('.img-container a._work').hasClass('multiple')

  // If there's only one image, it will be right there on the page.
  // If not, we will return an empty array to fill in later.
  const images = []
  if (!hasMultipleImages && !isAnimation) {
    images.push(scrapePixivSingleImage($, url, isLoggedIn))
  }
  else if (!hasMultipleImages && isAnimation) {
    images.push(scrapePixivAnimation($, url))
  }

  return {
    title,
    desc,
    images,
    score: {
      views,
      likes
    },
    author: {
      authorID,
      authorName
    },
    imageCount,
    hasMultipleImages,
    tags,
    isSFW: !isR18 && !isR18G,
    isR18,
    isR18G,
    isAnimation,
    isLoggedIn
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
  const bio = bioRaw ? he.decode(bioRaw.replace(bioBr, '\n')) : null

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
 */
const parsePixivManga = ($, url) => {
  const id = url.match(illustID)[1]
  const $containers = $('.item-container img.image')
  // Very confusing. jQuery's map() has the counter first. Regular map() has it after.
  const masterImages = $containers.map((n, img) => $(img).attr('data-src').trim()).get()
  const originalImages = masterImages.map((img, n) => ({ src: [pixivImgToOriginal(img), pixivMangaBigLink(id, n)] }))
  return originalImages
}

/**
 * Loads HTML for a Pixiv multiple images page (the 'manga' page)
 * and returns its images.
 */
const fetchPixivManga = async (mangaURL) => {
  const $mangaHTML = cheerio.load(await requestURL(mangaURL))
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
 */
export const fetchPixivSingle = async (rawURL, includeAuthorInfo = true) => {
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
    tasks.push(fetchPixivManga(pixivURLMode(url, 'manga')))
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
