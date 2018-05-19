/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import url from 'url'
import { get } from 'lodash'

import { requestURL } from '../util/request'
import { htmlToTerm } from '../util/format'

/**
 * Gives the oEmbed URL for a Tumblr post.
 */
const getOEmbedURL = (urlStr) => (
  `https://www.tumblr.com/oembed/1.0?url=${encodeURIComponent(urlStr)}`
)

/**
 * Retrieves all <img src="..." /> links from a snippet of HTML.
 */
const getImagesFromHTML = (html) => {
  const $ = cheerio.load(html)
  const images = $('img').map((n, img) => $(img).attr('src')).get()
  return images
}

/**
 * Returns all images found in an embedded post.
 * This includes the main image (for a photo post, for example) and all images
 * seen in the user replies to the post.
 */
const getImagesFromPost = (embeddedPostData, authorSub) => {
  // Retrieve the images. Posts that have replies from other people can have images, too.
  // That's why we keep an 'author' field for every individual image.
  const trailImages = embeddedPostData.trail.reduce((acc, post) => (
    [...acc, ...getImagesFromHTML(post.content_raw).map(img => ({ src: [img, null], author: post.blog.name }))]
  ), [])
  const postImages = embeddedPostData.photos.reduce((acc, photo) => (
    [...acc, { src: [photo.original_size.url, null], author: authorSub }]
  ), [])
  return [...postImages, ...trailImages]
}

/**
 * Returns only the scheme and host of a URL.
 * e.g. http://site.com/path is returned as just http://site.com/
 */
const getBaseURL = (urlStr) => {
  if (!urlStr) return null
  const { protocol, host } = url.parse(urlStr)
  return `${protocol}//${host}/`
}

/**
 * Retrieve data we're interested in from the embedded post data.
 * Tumblr gives us a lot of interesting information. Although we only need
 * a couple of fields, the rest can be displayed in a table while downloading.
 */
const scrapeRelevantData = (embeddedPostData) => {
  // Extract all the data we're interested in.
  const blogName = embeddedPostData.blog.title
  const blogSub = embeddedPostData.blog.name
  const blogURL = embeddedPostData.blog.url
  const slug = embeddedPostData.slug
  const isNSFW = embeddedPostData.is_nsfw
  const isPrivate = embeddedPostData.share_popover_data.is_private !== 0
  const id = embeddedPostData.id
  const postURL = embeddedPostData.post_url
  const date = new Date(embeddedPostData.date)
  const tags = embeddedPostData.tags
  const summary = embeddedPostData.summary
  const notes = embeddedPostData.notes.count
  const isReblog = embeddedPostData.is_reblog
  const hasSource = embeddedPostData.has_source
  const urlShort = embeddedPostData.share_popover_data.post_tiny_url

  const sourceName = embeddedPostData.reblogged_root_title
  const sourceSub = embeddedPostData.reblogged_root_name
  // We need to extract the author's full URL from the source_url to be safe.
  const sourceURL = getBaseURL(embeddedPostData.source_url)

  // Get all images out of the posts found in the embed.
  const images = getImagesFromPost(embeddedPostData, sourceSub || blogSub)

  return {
    slug,
    id,
    images,
    imageCount: images.length,
    isNSFW,
    isPrivate,
    isReblog,
    url: postURL,
    urlShort,
    date,
    tags,
    notes,
    summary,
    termSummary: htmlToTerm(embeddedPostData.caption),
    hasSource,
    ...(
      // Include source only if it's available.
      hasSource
        ? { source: { sourceURL, sourceName, sourceSub } }
        : {}
    ),
    blog: {
      blogURL,
      blogName,
      blogSub
    }
  }
}

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
    console.log('ascr: error: could not retrieve post data (possibly EU GDPR redirect bug; try again later after Tumblr fixes their embeds)')
    process.exit(1)
  }

  return postData
}

/**
 * Main entry point. Takes a Tumblr URL and retrieves its contents in a structured form.
 * To get the data we need to do two request calls.
 */
export const fetchTumblrSingle = async (urlStr) => {
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
  // Load that link and extract its data.
  const embeddedPostData = await getEmbeddedPostData(oEmbedData.html)

  // Get all the information we need from the post contents.
  return scrapeRelevantData(embeddedPostData)
}
