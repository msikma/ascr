/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import Table, { utils } from 'cli-table3'
import chalk from 'chalk'

import { indentWrap, bulletize } from './format'
import { isArray } from './isArray'

// Width of the rightmost column in characters.
const width = 54
// Maximum number of items permitted in arrays.
const arrayMax = 12
// Width of the progress bar. Should be the size of the whole table.
const progressBarWidth = 77

// Breaks very long words up by adding linebreaks to them.
const breakWords = (str, w = width) => (
  str
    .split(' ')
    .map(word => {
      let buffer = word
      let broken = ''
      let segment
      while (true) {
        segment = utils.truncateWidthWithAnsi(buffer, w - 2)
        if (segment.length < 1) {
          break
        }
        broken += `${segment}\n`
        buffer = buffer.substr(segment.length)
      }
      // Remove the last linebreak since it's unnecessary.
      return broken.substr(0, broken.length - 1)
    })
    .join(' ')
)

/**
 * Renders a progress bar based on the number of images downloaded and total.
 */
export const progressBar = (a, z) => {
  const factor = progressBarWidth / z
  const prog = Math.floor(a * factor)
  return '█'.repeat(prog) + '░'.repeat(progressBarWidth - (prog))
}

/**
 * Constructs a 'top' information table. This contains extra information,
 * such as the number of views and the rating of the work.
 * It can only have at most four columns.
 */
export const topTable = (kvData, warning) => {
  const table = new Table({ colWidths: [18, 18, 18, 18] })
  table.push(Object.keys(kvData).map(cell => chalk.blue(cell)))
  table.push(Object.values(kvData))
  if (warning) {
    table.push([{ colSpan: 4, content: chalk.red(warning) }])
  }
  return table
}

/**
 * Constructs a 'main' information table. This is a vertical table with columns on the left,
 * and values on the right. Contains e.g. title, description, author name.
 */
export const mainTable = (kvData) => {
  const table = new Table({ colWidths: [18, 56], wordWrap: false })
  const keys = Object.keys(kvData)
  table.push(...keys.reduce((acc, k) => {
    // If the value is an array, we'll we'll display it as a series
    // of lines with linebreaks. Limit the list to a maximum number of lines.
    let v = kvData[k]
    // Don't display a value if it's false, null or undefined.
    if (v === false || v == null) {
      return acc
    }
    if (isArray(v) && v.length > arrayMax) {
      v = [...v.slice(0, arrayMax - 1), `[...${v.length - (arrayMax - 1)} more]`]
    }
    return [...acc,
      [
        chalk.blue(k),
        // If the value is an array, wrap each item individually.
        isArray(v)
          ? v.map(i => bulletize(indentWrap(i, width - 2))).join('\n')
          : indentWrap(breakWords(v), width)
      ]
    ]
  }, []))
  return table
}
