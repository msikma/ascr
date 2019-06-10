/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import chalk from 'chalk'

import { topTable, mainTable } from '../util/tables'
import { formatDate, shortenString } from '../util/format'

export const printTumblrInfo = (info, printRawData) => {
  if (printRawData) {
    return console.log(info)
  }

  const metaData = {
    'Notes': info.notes,
    'Rating': info.isNSFW ? chalk.red('NSFW') : 'SFW',
    'Images': info.imageCount,
    'Date': formatDate(info.date)
  }

  const mainData = {
    'Blog title': shortenString(info.hasSource ? info.source.sourceName : info.blog.blogName, 50),
    'Blog URL': shortenString(info.hasSource ? info.source.sourceSub : info.blog.blogSub, 50),
    'Summary': info.summary.length ? shortenString(info.termSummary, 300) : false
  }

  // A post is either a reblog, or a source post.
  // We'll display one of these two tables based on which one it is.
  const reblogData = {
    'Reblogger': shortenString(info.blog && info.blog.blogSub, 50),
    // Omit tags if the list is empty.
    ...(info.tags.length > 0 ? { [`Reblogger's tags`]: info.tags } : {})
  }
  const sourceData = {
    'Tags': info.tags
  }
  const additionalData = info.isReblog ? reblogData : sourceData

  console.log(topTable(metaData).toString())
  console.log(mainTable({ ...mainData, ...additionalData }).toString())
}
