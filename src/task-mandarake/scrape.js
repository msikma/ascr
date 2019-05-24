/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import { requestURL } from '../util/request'

const cleanText = (str) => {
  return str
    .replace(/\t|\n/g, ' ')
    .replace(/ +(?= )/g,'')
    .trim()
}

/**
 * Parses an ekizo (auction) page and returns the images.
 */
const parseEkizoPage = ($, url) => {
  try {
    const $images = $('#itemImageUrlItems img#option')
    const images = $images.get().map(i => $(i).attr('src'))
    
    const itemName = cleanText($('#itemName').text())
    const desc = cleanText($('.item_description table').text())
    const size = cleanText($('.item_size').text())
    
    const crumbs = $('#breadcrumbItems a#option').get().reduce((cats, a) => {
      const $a = $(a)
      const $inner = $('#label', a)
      const href = $a.attr('href')
      const text = cleanText($inner.text())
      // Don't keep the 'home' link or the item we're looking at now.
      if (text.toLowerCase() === 'home' || !href) {
        return cats
      }
      return [...cats, [text, href.trim()]]
    }, [])

    const dateStart = new Date(cleanText($('#openDate').text()))
    const dateEnd = new Date(cleanText($('#strExtCloseDate').text()))
    const itemNumber = cleanText($('#itemNo').text())
    const price = `${cleanText($('#nowPrice-1').text())}円`
    const bids = cleanText($('#bidCount').text())
    const condition = cleanText($('#isCondition dd').text())
    const timeLeft = cleanText($('#timeLeft').text())

    return {
      title: itemName,
      desc: `${desc}\n${size}`,
      condition,
      timeLeft,
      price,
      bids,
      dateStart,
      dateEnd,
      itemNumber,
      url,
      categories: crumbs,
      images,
      imageCount: images.length
    }
  }
  catch (error) {
    return {
      error
    }
  }
}

/**
 * Extracts the images from a single ekizo (auction) page.
 */
export const fetchEkizoSingle = async (url) => {
  const html = await requestURL(url)
  const $ekizoHTML = cheerio.load(html)
  const ekizoInfo = parseEkizoPage($ekizoHTML, url)
  return ekizoInfo
}
