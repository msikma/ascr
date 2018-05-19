/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import { topTable, mainTable } from '../util/tables'

export const printTwitterInfo = (tweetsInfo, printRawData) => {
  if (printRawData) {
    return console.log(tweetsInfo)
  }

  // Display various error messages and exit if necessary.
  if (tweetsInfo[0].is404) {
    console.log(`ascr: error: given URL returned a page not found error (404)`)
    process.exit(1)
  }
  if (tweetsInfo[0].isUnknownError) {
    console.log(`ascr: error: Twitter returned an unknown error code while trying to scrape the page (possibly temporary)`)
    process.exit(1)
  }
  if (tweetsInfo[0].isUnauthorized) {
    console.log(`ascr: error: not authorized to view this tweet (login cookies are required from an account that follows the user)`)
    process.exit(1)
  }

  // Check whether we're including images from tweets other than the main tweet.
  // Most of the information we print (the description, likes, RTs, date) are from the main tweet.
  const hasThreadImages = tweetsInfo.length > 1
  const totalImages = tweetsInfo.reduce((n, tweet) => n + tweet.images.length, 0)
  const mainTweet = tweetsInfo.filter(t => t.isMainTweet === true)[0]

  const metaData = {
    'Retweets': mainTweet.score.retweets,
    'Likes': mainTweet.score.likes,
    [hasThreadImages ? 'Images (thread)' : 'Images']: totalImages,
    'Date': mainTweet.date
  }

  const mainData = {
    'Description': mainTweet.tweet.tweetText.substr(0, 300),
    'Author': mainTweet.author.authorName.substr(0, 50)
  }

  console.log(topTable(metaData).toString())
  console.log(mainTable(mainData).toString())
}
