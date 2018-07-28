/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import tumblr from 'tumblr.js'
import URL from 'url-parse'

import { readFile } from '../util/files'

let client

/**
 * Initialize the API client.
 */
const initializeClient = (credentials) => {
  client = tumblr.createClient({ credentials, returnPromises: true })
}

/**
 * Returns the API keys from the user's tumblr.json file, if it exists.
 * If no keys could be found, false is returned. In that case we'll use the oEmbed route
 * to get a post URL's information.
 */
export const findAPIKeys = async (tumblrJSON = null, isDefault = true) => {
  if (!tumblrJSON) return false

  try {
    const data = JSON.parse(await readFile(tumblrJSON))
    if (data.consumer_key && data.consumer_secret) return data
    console.log(`ascr: error: found a tumblr.json file, but it did not contain 'consumer_key' or 'consumer_secret'.`)
  }
  catch (err) {
    // Only log an error if the user specified a non-default.
    if (!isDefault) {
      console.warn(`ascr: warning: could not load tumblr.json file: ${tumblrJSON}`)
    }
  }
  return false
}

/**
 * Extracts the blog name and post ID.
 */
const getURLInfo = (urlStr) => {
  try {
    // Get the hostname of the URL. We don't need to remove .tumblr.com.
    const blog = new URL(urlStr).host
    const idMatches = urlStr.match(/\/([0-9]+)\//)

    return {
      blog,
      id: idMatches[1]
    }
  }
  catch (err) {
    return { blog: null, id: null }
  }
}

/**
 * Connect to the Tumblr API and retrieve post information about the URL.
 * This information is then fed back to the post scraper. Both the oEmbed method
 * and the API method retrieve essentially the same data.
 */
export const fetchDataViaAPI = async (urlStr, apiKeys) => {
  // Connect with our API keys.
  if (!client) initializeClient(apiKeys)

  const { blog, id } = getURLInfo(urlStr)
  if (!blog || !id) {
    console.log('ascr: error: could not get a valid blog name and ID from the given URL.')
    process.exit(0)
  }
  const postData = await client.blogPosts(blog, { id, reblog_info: true, notes_info: true })

  // Merge the first post's data into the main object.
  // This is more similar to the oEmbed data.
  return { ...postData, ...postData.posts[0] }
}
