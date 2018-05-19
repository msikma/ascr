/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { tweetCheck } from './index'
import { htmlToTerm } from '../util/format'
import { requestURL } from '../util/request'

// The Twitter error code for a 404.
const ERROR_404 = 34

// Add these headers to prevent Twitter's "continue" page.
const safetyHeaders = {
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://twitter.com/?lang=en',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Twitter-Active-User': 'yes'
}

// Returns the text of a tweet, modified to look good in a terminal.
const getTweetText = ($, $tweet) => {
  // Add a single space before every timeline link.
  $('.twitter-timeline-link', $tweet).each((n, el) => $(el).before($('<span> </span>')))
  return htmlToTerm($tweet.html().trim())
}

/**
 * Main parsing logic. This will extract information from a tweet - either a "main" tweet
 * (the one that the URL belongs to), or replies to that tweet, which are structured a little differently.
 */
const parseTwitterPost = ($, tweet, authorName, tweetID, n) => {
  const tweetText = getTweetText($, $('.tweet-text', tweet))

  // These values will be undefined if this is a reply to the main tweet.
  const retweetsReq = $('.request-favorited-popup', tweet).attr('data-tweet-stat-count')
  const likesReq = $('.request-favorited-popup', tweet).attr('data-tweet-stat-count')
  // These yield values if the tweet is a reply.
  const retweetsProfile = $('.ProfileTweet-action--retweet .js-actionRetweet:not(.ProfileTweet-actionButtonUndo) .ProfileTweet-actionCountForPresentation', tweet).text()
  const likesProfile = $('.ProfileTweet-action--favorite .js-actionFavorite:not(.ProfileTweet-actionButtonUndo) .ProfileTweet-actionCountForPresentation', tweet).text()

  const retweetsN = parseInt(retweetsReq ? retweetsReq : retweetsProfile, 10)
  const likesN = parseInt(likesReq ? likesReq : likesProfile, 10)
  const retweets = isNaN(retweetsN) ? 0 : retweetsN
  const likes = isNaN(likesN) ? 0 : likesN

  // Get image URLs. We used to get this from a meta tag, but since
  // we now support getting chains of tweets, we get them from the media container.
  // These images come in the form of e.g. 'https://pbs.twimg.com/media/123456.jpg'
  // so we can simply append :orig to get the original size.
  const imageURLs = $('.AdaptiveMedia-container img', tweet).map((_, el) => `${$(el).attr('src')}:orig`).get()
  const imageCount = imageURLs.length
  // Add 'null' to indicate we don't need to set a referrer to download these images.
  const images = imageURLs.map(i => ({ src: [i, null] }))

  const dateBits = $('.js-tweet-details-fixer .client-and-actions .metadata > span:nth-child(1)', tweet).text().split('-')
  const date = dateBits.length >= 2 ? dateBits[1].trim() : null

  return {
    tweet: {
      tweetText,
      tweetID
    },
    isMainTweet: n === 0,
    images,
    date,
    score: {
      retweets,
      likes
    },
    author: {
      authorName
    },
    imageCount
  }
}

// Parses a series of Twitter posts.
const parseTwitterPosts = ($, authorName, tweetID, noThread, is404 = false, isUnknownError = false) => {
  // Check whether this is a 404 or some other error.
  if (is404) return [{ is404, author: { authorName }, tweet: { tweetID } }]
  if (isUnknownError) return [{ isUnknownError, author: { authorName }, tweet: { tweetID } }]

  // Check whether we can view this post at all. If it's a private post and we don't
  // have the authority to view it, we'll display an error.
  const isUnauthorized = $('.ProtectedTimeline-heading').length > 0
  if (isUnauthorized) return [{ isUnauthorized, author: { authorName }, tweet: { tweetID } }]

  // Fetch the original tweet and any replies made by the author in their self-thread(s).
  // If 'noThread' is true, we omit the latter.
  const originalTweet = `.tweet.js-original-tweet[data-screen-name="${authorName}"]`
  const selfThreadTweets = `.ThreadedConversation--selfThread .tweet[data-screen-name="${authorName}"]`
  const $tweets = $(`${originalTweet}${noThread ? '' : `, ${selfThreadTweets}`}`)
  const tweets = $tweets.get().map((tweet, n) => parseTwitterPost($, tweet, authorName, tweetID, n))
  // Remove tweets that have no images. Except for the first one. If there are no images in the main tweet,
  // we'll keep it so we can show an error message later.
  return tweets.filter(t => t.isMainTweet === true || t.images.length > 0)
}

/**
 * Main entry point. Retrieves information about a single Twitter post.
 * A post, however, can contain replies - we also fetch information from replies,
 * but only replies by the original tweet author.
 *
 * If --no-thread is passed, only the original post's images are downloaded.
 */
export const fetchTwitterSingle = async (url, noThread) => {
  // Extract username and tweet ID from the URL.
  const urlInfo = url.match(tweetCheck)
  const html = await requestURL(url, safetyHeaders)

  // If the page is a 404, we don't get HTML (due to our headers specifying that this is an XHR).
  // Instead, we get JSON. If this is the case, we'll pass it on to the parser - it will then return
  // the appropriate error data be used later. The error code for a 404 is '34'.
  // In case we receive a totally different error code, we'll display an unknown error warning later.
  let is404 = false
  let isUnknownError = false
  try {
    const parsedJSON = JSON.parse(html)
    is404 = parsedJSON.errors[0].code === ERROR_404
    isUnknownError = parsedJSON.errors[0].code !== ERROR_404
  }
  catch (e) {
    // Nothing.
  }

  // Parse the HTML (if it's there) and pass it on along with any errors.
  const $postHTML = cheerio.load(html)
  return parseTwitterPosts($postHTML, urlInfo[1], urlInfo[2], noThread, is404, isUnknownError)
}
