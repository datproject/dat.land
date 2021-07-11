const html = require('choo/html')
const wrapper = require('./wrapper')

module.exports = wrapper(function (state, emit) {
  return html`
    <div>
      <section class="section">
        <!--<div class="container">
          <h1>Desktop app</h1>
          <h5>Open the desktop app and copy/paste the link into the 'Import Dat' box.</h5>
          <p class="tc pv3 color-white">
           <a href="http://datproject.github.io/dat-desktop/mac" class="btn btn--green btn--full btn--cta open-desktop mt2" target="_blank">
             <svg><use xlink:href="#daticon-open-in-desktop"/></svg>
             Download for Mac
           </a>
           <a href="http://datproject.github.io/dat-desktop/linux" class="btn btn--green btn--cta open-desktop mt2" target="_blank">
             <svg><use xlink:href="#daticon-open-in-desktop"/></svg>
             Download for Linux
           </a>
         </p>
         <p class="f7 tc color-neutral-50">
           Windows coming soon.
         </p>
        </div>-->
        <div class="container">
          <h1 class="f1 content-title horizontal-rule">Using the Terminal</h1>
          <h5>1. <a href="http://nodejs.org">Install node for your platform.</a></h5>
          <h5>2. Use npm to install the dat command line tool.</h5>
          <pre><code>$ npm install -g dat</code></pre>

          <h5>3. Then download the archive.</h5>
          <pre><code>$ dat clone ${state.archive.key}</code></pre>
          <p>
            Having trouble installing dat? Find other <a href="http://docs.datproject.org/install">installation options</a> or ask questions in our public chatroom.
          </p>
          <a href="http://webchat.freenode.net/?channels=dat" target="_blank">
          <img src="https://img.shields.io/badge/irc%20channel-%23dat%20on%20freenode-blue.svg">
          </a>
          <a href="https://gitter.im/datproject/discussions?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge" target="_blank">
          <img src="https://badges.gitter.im/Join%20Chat.svg">
          </a>
        </div>
      </section>
    </div>
  `
})
