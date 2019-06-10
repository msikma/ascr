/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'

/**
 * Takes apart a Pixiv ?mode=medium page and extracts information.
 *
 * This version of the page was in use until late May 2018. Since I'm not sure
 * whether everybody is seeing the new page yet, we're checking for it and
 * scraping with this old code if necessary. The page was changed to a different
 * version less than a week after Ascr was first published to npm.
 *
 * We check whether we're logged in at this point as well.
 */
export const parsePixivMediumUntilMay2018 = ($, url) => {
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

  // I'm not entirely sure why the R-18 breadcrumbs don't always show up.
  // Or maybe it only doesn't show up on medium pages that lead to an RTL manga.
  // Either way, this should cover every possibility.
  const isR18Base = isLoggedIn ? $('.meta .r-18', $info).length > 0 : $('.breadcrumb a[href*="R-18"]').length > 0
  const isR18GBase = isLoggedIn ? $('.meta .r-18g', $info).length > 0 : $('.breadcrumb a[href*="R-18G"]').length > 0
  const isR18Image = $('.r18-image').length > 1
  // R18G is only in the keywords...
  const isR18GKeyword = $('meta[name="keywords"]').attr('content').split(',').indexOf('R-18G') > -1
  const isR18 = isR18Base || isR18Image
  const isR18G = isR18GBase || isR18GKeyword

  const isAnimation = $('._ugoku-illust-player-container', $work).length > 0
  const tags = $(isLoggedIn ? '.tags .tag a.text' : '#tag_area .tag a.text').map((n, tag) => $(tag).text().trim()).get()
  const authorName = $(isLoggedIn ? '.user-name' : 'a', $author).text().trim()

  // When retrieving the author ID, it matters if we are logged in or not.
  // If not logged in, the ID can be found elsewhere. First, try the logged in version.
  const authorIDLI = $('.column-header .tabs a[href*="member.php?"]').attr('href')
  const authorIDRaw = authorIDLI ? authorIDLI : $('.userdata-row .name a[href*="member.php?"]').attr('href')
  const authorID = Number(authorIDRaw.match(/member\\.php\?.*id=([0-9]+)/)[1])

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
