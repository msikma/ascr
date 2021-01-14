/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import draftLog from 'draftlog'
import util from 'util'

// Monkey patch the console object with draftlog.
draftLog.into(console)

export const logDeep = (obj) => {
  console.log(util.inspect(obj, { showHidden: false, depth: 9, colors: true }))
}

const disableLogging = () => {
  console.log = () => {}
}

export default disableLogging
