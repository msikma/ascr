/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import { get } from 'lodash'

import { requestURL } from '../util/request'

/**
 * Gives the oEmbed URL for a Tumblr post.
 */
const getOEmbedURL = (urlStr) => (
  `https://www.tumblr.com/oembed/1.0?url=${encodeURIComponent(urlStr)}`
)

/**
 * Takes an oEmbed HTML snippet and follows its embedded post URL.
 * It then takes the data from that post URL and returns it.
 */
const getEmbeddedPostData = async (oEmbedHTML) => {
  // The link we need is in a <div class="tumblr-post" data-href="..." ...>
  const $oembed = cheerio.load(oEmbedHTML)
  const postURL = $oembed('.tumblr-post').attr('data-href').trim()
  const postHTML = await requestURL(postURL)

  // We've now retrieved the embedded post HTML.
  // The data is in <noscript data-bootstrap="...">
  const $post = cheerio.load(postHTML)
  const bootstrapData = JSON.parse($post('noscript[data-bootstrap]').attr('data-bootstrap').trim())
  // Ignore most of the metadata and return only the post data.
  const postData = get(bootstrapData, 'Components.EmbeddablePost.posts_data[0]')

  if (!postData) {
    // FIXME: Tumblr, for some reason, has decided to redirect everyone in the EU viewing an embed URL.
    // It 303 "See Other" redirects users to a /privacy/consent page, which is broken.
    // Since the page is broken, it redirects to the Tumblr homepage. Where of course we don't have this data.
    // My guess is they are trying to implement GDPR (a little late...), but either screwed up or realized
    // they can't do it in time, so they just broke it for everyone in the EU. Outside of the EU everything works.
    // So if we don't have 'postData' at this point, it COULD be that this is the "GDPR redirect bug."
    console.log('ascr: error: could not retrieve post data (possibly EU GDPR redirect bug; try again later after Tumblr fixes their embeds, or set up an API key as per the readme)')
    process.exit(1)
  }

  return postData
}

export const fetchDataViaOEmbed = async (urlStr) => {
  // To get the data, we need to load the oEmbed data first.
  // This contains an embed link with all the information we need,
  // without the user's custom theme to make scraping difficult.
  const oEmbedURL = getOEmbedURL(urlStr)
  const oEmbedData = JSON.parse(await requestURL(oEmbedURL))

  // Handle common errors.
  if (!oEmbedData) {
    console.log('ascr: error: could not retrieve post data')
    process.exit(1)
  }
  if (oEmbedData && oEmbedData.meta && oEmbedData.meta.status === 404) {
    console.log('ascr: error: given URL returned a page not found error (404)')
    process.exit(1)
  }

  // The oEmbed data contains an HTML snippet with the link we need.
  // Lastly we'll extract that link and get the data from there.
  return await getEmbeddedPostData(oEmbedData.html)
}
