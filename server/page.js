const xtend = require('extend')
const datIcons = require('dat-icons/raw')
const serializeJS = require('serialize-javascript')

function page (url, contents, appState) {
  var dehydratedAppState = serializeJS(appState)
  var defaultMetadata = {
    title: 'datDirectory - Open data powered by Dat',
    author: 'Dat Project',
    description: 'Future-friendly apps for your research data pipeline.',
    image: 'https://datbase.org/public/img/dat-hexagon.png',
    twitterImage: 'https://datbase.org/public/img/dat-data-logo.png',
    twitterSite: '@dat_project'
  }

  function renderMetaTags () {
    var md = appState.archive && appState.archive.metadata ? appState.archive.metadata : {}
    md = xtend(defaultMetadata, md)
    return `<meta name="title" content="${md.title}" />
      <meta property="og:title" content="${md.title}" />
      <meta name="author" content="${md.author}" />
      <meta name="description" content="${md.description}" />
      <meta property="og:description" content="${md.description}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:image" content="${md.image}" />
      <meta property="twitter:site" content="${md.twitterSite}" />
      <meta property="twitter:image" content="${md.twitterImage}" />`
  }

  return `<html>
      <head>
        <meta charset="utf-8" />
        <title>${defaultMetadata.title}</title>
        <link rel="stylesheet" type="text/css" href="/public/css/app.css"/>
        <link rel="icon" href="/public/img/favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${renderMetaTags()}
        <meta property="og:site_name" content="DatBase" />
        <meta property="og:type" content="article" />
      </head>
      <body>
        <div id="app">
          <div id="app-root">
            ${contents}
          </div>
        </div>
      </body>
      ${datIcons()}
      <script>
        window._store = ${dehydratedAppState};
      </script>
      <script type="text/javascript" src="/public/js/app.js"></script>
    </html>`
}

module.exports = page
