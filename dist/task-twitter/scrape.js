'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTwitterSingle = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _index = require('./index');

var _format = require('../util/format');

var _request = require('../util/request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// The Twitter error code for a 404.
var ERROR_404 = 34;

// Add these headers to prevent Twitter's "continue" page.
var safetyHeaders = {
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://twitter.com/?lang=en',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Twitter-Active-User': 'yes'

  // Returns the text of a tweet, modified to look good in a terminal.
};var getTweetText = function getTweetText($, $tweet) {
  // Add a single space before every timeline link.
  $('.twitter-timeline-link', $tweet).each(function (n, el) {
    return $(el).before($('<span> </span>'));
  });
  return (0, _format.htmlToTerm)($tweet.html().trim());
};

/**
 * Main parsing logic. This will extract information from a tweet - either a "main" tweet
 * (the one that the URL belongs to), or replies to that tweet, which are structured a little differently.
 */
var parseTwitterPost = function parseTwitterPost($, tweet, authorName, tweetID, n) {
  var tweetText = getTweetText($, $('.tweet-text', tweet));

  // These values will be undefined if this is a reply to the main tweet.
  var retweetsReq = $('.request-favorited-popup', tweet).attr('data-tweet-stat-count');
  var likesReq = $('.request-favorited-popup', tweet).attr('data-tweet-stat-count');
  // These yield values if the tweet is a reply.
  var retweetsProfile = $('.ProfileTweet-action--retweet .js-actionRetweet:not(.ProfileTweet-actionButtonUndo) .ProfileTweet-actionCountForPresentation', tweet).text();
  var likesProfile = $('.ProfileTweet-action--favorite .js-actionFavorite:not(.ProfileTweet-actionButtonUndo) .ProfileTweet-actionCountForPresentation', tweet).text();

  var retweetsN = parseInt(retweetsReq ? retweetsReq : retweetsProfile, 10);
  var likesN = parseInt(likesReq ? likesReq : likesProfile, 10);
  var retweets = isNaN(retweetsN) ? 0 : retweetsN;
  var likes = isNaN(likesN) ? 0 : likesN;

  // Get image URLs. We used to get this from a meta tag, but since
  // we now support getting chains of tweets, we get them from the media container.
  // These images come in the form of e.g. 'https://pbs.twimg.com/media/123456.jpg'
  // so we can simply append :orig to get the original size.
  var imageURLs = $('.AdaptiveMedia-container img', tweet).map(function (_, el) {
    return $(el).attr('src') + ':orig';
  }).get();
  var imageCount = imageURLs.length;
  // Add 'null' to indicate we don't need to set a referrer to download these images.
  var images = imageURLs.map(function (i) {
    return { src: [i, null] };
  });

  var dateBits = $('.js-tweet-details-fixer .client-and-actions .metadata > span:nth-child(1)', tweet).text().split('-');
  var date = dateBits.length >= 2 ? dateBits[1].trim() : null;

  return {
    tweet: {
      tweetText: tweetText,
      tweetID: tweetID
    },
    isMainTweet: n === 0,
    images: images,
    date: date,
    score: {
      retweets: retweets,
      likes: likes
    },
    author: {
      authorName: authorName
    },
    imageCount: imageCount
  };
};

// Parses a series of Twitter posts.
var parseTwitterPosts = function parseTwitterPosts($, authorName, tweetID, noThread) {
  var is404 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var isUnknownError = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  // Check whether this is a 404 or some other error.
  if (is404) return [{ is404: is404, author: { authorName: authorName }, tweet: { tweetID: tweetID } }];
  if (isUnknownError) return [{ isUnknownError: isUnknownError, author: { authorName: authorName }, tweet: { tweetID: tweetID } }];

  // Check whether we can view this post at all. If it's a private post and we don't
  // have the authority to view it, we'll display an error.
  var isUnauthorized = $('.ProtectedTimeline-heading').length > 0;
  if (isUnauthorized) return [{ isUnauthorized: isUnauthorized, author: { authorName: authorName }, tweet: { tweetID: tweetID } }];

  // Fetch the original tweet and any replies made by the author in their self-thread(s).
  // If 'noThread' is true, we omit the latter.
  var originalTweet = '.tweet.js-original-tweet[data-screen-name="' + authorName + '"]';
  var selfThreadTweets = '.ThreadedConversation--selfThread .tweet[data-screen-name="' + authorName + '"]';
  var $tweets = $('' + originalTweet + (noThread ? '' : ', ' + selfThreadTweets));
  var tweets = $tweets.get().map(function (tweet, n) {
    return parseTwitterPost($, tweet, authorName, tweetID, n);
  });
  // Remove tweets that have no images. Except for the first one. If there are no images in the main tweet,
  // we'll keep it so we can show an error message later.
  return tweets.filter(function (t) {
    return t.isMainTweet === true || t.images.length > 0;
  });
};

/**
 * Main entry point. Retrieves information about a single Twitter post.
 * A post, however, can contain replies - we also fetch information from replies,
 * but only replies by the original tweet author.
 *
 * If --no-thread is passed, only the original post's images are downloaded.
 */
var fetchTwitterSingle = exports.fetchTwitterSingle = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, noThread) {
    var urlInfo, html, is404, isUnknownError, parsedJSON, $postHTML;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Extract username and tweet ID from the URL.
            urlInfo = url.match(_index.tweetCheck);
            _context.next = 3;
            return (0, _request.requestURL)(url, safetyHeaders);

          case 3:
            html = _context.sent;


            // If the page is a 404, we don't get HTML (due to our headers specifying that this is an XHR).
            // Instead, we get JSON. If this is the case, we'll pass it on to the parser - it will then return
            // the appropriate error data be used later. The error code for a 404 is '34'.
            // In case we receive a totally different error code, we'll display an unknown error warning later.
            is404 = false;
            isUnknownError = false;

            try {
              parsedJSON = JSON.parse(html);

              is404 = parsedJSON.errors[0].code === ERROR_404;
              isUnknownError = parsedJSON.errors[0].code !== ERROR_404;
            } catch (e) {}
            // Nothing.


            // Parse the HTML (if it's there) and pass it on along with any errors.
            $postHTML = _cheerio2.default.load(html);
            return _context.abrupt('return', parseTwitterPosts($postHTML, urlInfo[1], urlInfo[2], noThread, is404, isUnknownError));

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchTwitterSingle(_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();