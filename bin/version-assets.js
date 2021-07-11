#!/usr/bin/env node
var fs = require('fs')
var Version = require('node-version-assets')

// productionize `server/page.js` by updating asset references
// `main.css` -> 'main.min.css'
// `app.js` -> `app.min.js`
// re-name original, un-productionized `page.js` to `page-debug.html`
var page = 'server/page.js'
var pageContents = fs.readFileSync(page, 'utf8')
fs.renameSync(page, 'server/page-debug.js')

var prod = pageContents
  .replace(/public\/css\/app.css/gmi, 'public/css/app.min.css')
  .replace(/public\/js\/app.js/gmi, 'public/js/app.min.js')
fs.writeFileSync(page, prod, 'utf8')

// version `app.min.js` and `main.min.js` by appending md5 hash to filename
// & update references to files in `server/page.js`
var versionInstance = new Version({
  assets: [
    'public/js/app.min.js',
    'public/css/app.min.css'
  ],
  grepFiles: [
    page
  ],
  keepOriginal: true,
  keepOldVersions: false
})

versionInstance.run()
