/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'
import { requestURL } from '../util/request'

/** Removes extra whitespace from text. */
const cleanText = (str) => {
  return str
    .replace(/\t|\n/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim()
}

/**
 * Parsers a regular shop item page and returns its data and images.
 */
const parseShopPage = ($, url) => {
  try {
    const id = url.match(/itemCode=([0-9]+)&/)[1]
    const images = $('.detail_item .xzoom-thumbs li img').get().map(img => $(img).attr('src'))
    const itemName = cleanText($('.content_head .subject').text())
    const desc = cleanText($('.detail_panel .caption').text())
    const itemNumber = cleanText($('.detail_panel .__itemno').text())
    const price = `${cleanText($('.detail_panel .__price').text())}円`
    return {
      titlePlain: itemName,
      title: `${id} ${itemName}`,
      desc: `${desc}`,
      price,
      itemNumber,
      url,
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
 * Parses an ekizo (auction) page and returns its data and images.
 */
const parseEkizoPage = ($, url) => {
  try {
    const id = url.match(/index=([0-9]+)$/)[1]
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
      titlePlain: itemName,
      title: `${id} ${itemName}`,
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

/**
 * Extracts the images from a single ekizo (auction) page.
 */
export const fetchShopSingle = async (url) => {
  const html = await requestURL(url)
  const $shopHTML = cheerio.load(html)
  const itemInfo = parseShopPage($shopHTML, url)
  return itemInfo
}
