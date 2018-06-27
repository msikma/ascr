/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2018, Michiel Sikma
 */

import moment from 'moment'
import cheerio from 'cheerio'
import chalk from 'chalk'
import stripAnsi from 'strip-ansi'
import wrapAnsi from 'wrap-ansi'

const leadingSpaceRe = new RegExp('(^[ ]+)', 'g')

/**
 * Returns a formatted date from a Javascript date.
 */
export const formatDate = (date) => (
  moment(date).format('Y-MM-DD')
)

/**
 * Shortens a string to a certain number of characters.
 * Also add [...] at the end of a shortened string.
 */
export const shortenString = (str, amount) => (
  str && str.length > amount ? `${str.substr(0, amount - 6)} [...]` : str
)

/**
 * Adds strikethrough effect to text.
 * Fakes a strikethrough on terminals that don't support it.
 */
const addStrike = (str) => (
  chalk.strikethrough(str.split('').join('\u0336'))
)

/**
 * Replaces a node with the output of a formatter function.
 */
const replaceNode = ($, $selector, formatter) => (
  $selector.each((n, el) => {
    const $el = $(el)
    $el.replaceWith(formatter($el.text()))
  })
)

/**
 * Replaces linebreaks with newlines.
 */
const replaceBreaks = ($) => (
  $('br').replaceWith('\n')
)

/**
 * Replaces HTML blockquotes with indented text.
 */
const replaceBlockquotes = ($, indent = 3, element = 'blockquote') => {
  let $nodes
  let $nextNode
  while (true) {
    $nodes = $(element)
    if (!$nodes.length) break
    $nextNode = $($nodes[0])
    $nextNode.replaceWith($nextNode.html().split('\n').join(`\n${' '.repeat(indent)}`))
  }
}

/**
 * Removes empty lines and ensures all lines with content are separated by one (or two, if chosen), linebreaks.
 */
const filterLinebreaks = (str, doubleBreak = false) => {
  const trimmed = str.split('\n').map(s => s.trimRight())
  return trimmed.filter(s => s !== '').join(doubleBreak ? '\n\n' : '\n')
}

/**
 * Adds a bullet to the start of a line. This should be used on lines wrapped by e.g. wrapLineWithIndent().
 */
export const bulletize = (line) => (
  line.split('\n').map((segment, n) => (n === 0 ? `• ${segment}` : `  ${segment}`)).join('\n')
)

/**
 * Returns the number of leading spaces a line has.
 */
const getLeadingSpace = (line) => {
  const match = stripAnsi(line).match(leadingSpaceRe)
  return match ? match[0].length : 0
}

/**
 * Wraps a single line, while keeping however many indent spaces it has.
 */
const wrapLineWithIndent = (line, width, linebreak) => {
  const indent = getLeadingSpace(line)
  return wrapAnsi(line, width - indent)
    .split(linebreak)
    .map(l => `${' '.repeat(indent)}${l}`)
    .join(linebreak)
}

/**
 * Wraps lines while keeping their ANSI codes (e.g. Terminal color codes) intact,
 * and without breaking leading indents.
 *
 * For example, a line starting with '   long text goes here' (which has 3 leading spaces)
 * is wrapped in such a way that each line we produce also has 3 leading spaces.
 */
export const indentWrap = (input, width, linebreak = '\n') => (
  input
    .split(linebreak)
    .map(line => wrapLineWithIndent(line, width, linebreak))
    .join(linebreak)
)

/**
 * Converts an HTML string to something we can display in a terminal.
 */
export const htmlToTerm = (html, convertLinebreaks = false) => {
  if (!html) return ''
  const $ = cheerio.load(html)
  replaceNode($, $('b, strong'), text => chalk.bold(text))
  replaceNode($, $('i, em'), text => chalk.italic(text))
  replaceNode($, $('a'), text => chalk.underline.green(text))
  replaceNode($, $('strike'), text => addStrike(text))
  replaceNode($, $('p'), text => `\n${text}\n`)
  replaceBlockquotes($)
  if (convertLinebreaks) {
    replaceBreaks($)
  }
  return filterLinebreaks($.text())
}
