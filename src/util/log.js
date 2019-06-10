/**
 * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
 * Copyright © 2019, Michiel Sikma
 */

import draftLog from 'draftlog'

// Monkey patch the console object with draftlog.
draftLog.into(console)

const disableLogging = () => {
  console.log = () => {}
}

export default disableLogging
