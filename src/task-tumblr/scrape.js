/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import cheerio from 'cheerio'
import url from 'url'
import { get } from 'lodash'

import { fetchDataViaOEmbed } from './oembed'
import { fetchDataViaAPI, findAPIKeys } from './api'
import { htmlToTerm } from '../util/format'

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
  const trailData = embeddedPostData.trail || []
  const postData = embeddedPostData.photos || []
  const trailImages = trailData.reduce((acc, post) => (
    [...acc, ...getImagesFromHTML(post.content_raw).map(img => ({ src: [img, null], author: post.blog.name }))]
  ), [])
  const postImages = postData.reduce((acc, photo) => (
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
  if (!embeddedPostData) return null

  // Extract all the data we're interested in.
  const blogName = embeddedPostData.blog.title
  const blogSub = embeddedPostData.blog.name
  const blogURL = embeddedPostData.blog.url
  const slug = embeddedPostData.slug
  const isNSFW = embeddedPostData.is_nsfw
  // Some discrepancy here between oEmbed and API data.
  const isPrivate = get(embeddedPostData, 'share_popover_data.is_private') != null
    ? get(embeddedPostData, 'share_popover_data.is_private') !== 0
    : get(embeddedPostData, 'state') !== 'private'
  const id = embeddedPostData.id
  const postURL = embeddedPostData.post_url
  const date = new Date(embeddedPostData.date)
  const tags = embeddedPostData.tags
  const summary = embeddedPostData.summary
  const notes = get(embeddedPostData, 'notes.count', embeddedPostData.notes.length)
  const isReblog = embeddedPostData.is_reblog
  const hasSource = embeddedPostData.has_source
  const urlShort = get(embeddedPostData, 'share_popover_data.post_tiny_url', embeddedPostData.short_url)

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
 * Main entry point. Takes a Tumblr URL and retrieves its contents in a structured form.
 * To get the data we need to do two request calls.
 */
export const fetchTumblrSingle = async (urlStr, tumblrJSON = null, isDefault = true) => {
  // Check to see if the user is supplying API keys as per the readme file.
  // If not, this will return false.
  const apiKeys = await findAPIKeys(tumblrJSON, isDefault)
  // If no API keys, attempt to get post data through the oEmbed API.
  if (!apiKeys) return scrapeRelevantData(await fetchDataViaOEmbed(urlStr))
  // Else, run the API code.
  return scrapeRelevantData(await fetchDataViaAPI(urlStr, apiKeys))
}
