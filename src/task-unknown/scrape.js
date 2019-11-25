/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'
import { getURLDomain, getURLPage } from '../util/name'
import { requestURL } from '../util/request'

// Parses a page which may or may not have images.
const parsePage = ($, baseURL, url) => {
  const $a = $('a')
  const imgLinks = $a.get().map(a => {
    const href = $(a).attr('href')
    if (!href) return ''
    const clean = href.split('?')[0]
    return clean.trim()
  }).filter(url => /\.(jpg|jpeg|png|gif|bmp)$/.test(url)).filter(url => !!url)
  const imgAbs = imgLinks.map(url => {
    if (url.startsWith('/') || /^https?:\/\//.test(url) || url.startsWith('ftp://')) {
      return url
    }
    else {
      return `${baseURL}/${url}`
    }
  })
  const title = $('head title').text().trim()
  const lang = $('html').attr('lang') || 'n/a'
  const domain = getURLDomain(url)
  const page = getURLPage(url)

  return {
    title,
    lang,
    baseURL,
    url,
    page,
    domain,
    images: imgAbs.map(url => ({ src: [url, null] })),
    imageCount: imgAbs.length
  }
}

export const fetchGenericURL = async (url) => {
  const baseURL = url.split('/').slice(0, -1).join('/')
  const html = await requestURL(url)

  // Parse the HTML (if it's there) and pass it on along with any errors.
  const $postHTML = cheerio.load(html)
  return parsePage($postHTML, baseURL, url)
}
