'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printTwitterInfo = undefined;

var _tables = require('../util/tables');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                   * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                   */

var printTwitterInfo = exports.printTwitterInfo = function printTwitterInfo(tweetsInfo, printRawData) {
  var _metaData;

  if (printRawData) {
    return console.log(tweetsInfo);
  }

  // Display various error messages and exit if necessary.
  if (tweetsInfo[0].is404) {
    console.log('ascr: error: given URL returned a page not found error (404)');
    process.exit(1);
  }
  if (tweetsInfo[0].isUnknownError) {
    console.log('ascr: error: Twitter returned an unknown error code while trying to scrape the page (possibly temporary)');
    process.exit(1);
  }
  if (tweetsInfo[0].isUnauthorized) {
    console.log('ascr: error: not authorized to view this tweet (login cookies are required from an account that follows the user)');
    process.exit(1);
  }

  // Check whether we're including images from tweets other than the main tweet.
  // Most of the information we print (the description, likes, RTs, date) are from the main tweet.
  var hasThreadImages = tweetsInfo.length > 1;
  var totalImages = tweetsInfo.reduce(function (n, tweet) {
    return n + tweet.images.length;
  }, 0);
  var mainTweet = tweetsInfo.filter(function (t) {
    return t.isMainTweet === true;
  })[0];

  var metaData = (_metaData = {
    'Retweets': mainTweet.score.retweets,
    'Likes': mainTweet.score.likes
  }, _defineProperty(_metaData, hasThreadImages ? 'Images (thread)' : 'Images', totalImages), _defineProperty(_metaData, 'Date', mainTweet.date), _metaData);

  var mainData = {
    'Description': mainTweet.tweet.tweetText.substr(0, 300),
    'Author': mainTweet.author.authorName.substr(0, 50)
  };

  console.log((0, _tables.topTable)(metaData).toString());
  console.log((0, _tables.mainTable)(mainData).toString());
};