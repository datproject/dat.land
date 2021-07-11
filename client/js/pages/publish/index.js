const html = require('choo/html')
const wrapper = require('../wrapper')

const publish = (state, emit) => {
  emit(state.events.DOMTITLECHANGE, 'Publish | datDirectory')
  return html`
    <div class="">
    <section class="section bg-splash-02" id="publish">
      <div class="container">
          <div class="col-xs-12 col-sm-5 flex flex-column justify-center">
        <h1>Publish a Dat</h1>
        <p>Dats are not visible until their link is shared. You can publish a dataset
        here to make your dat public. </p>
        <pre><code>$ npm install -g dat
$ cd /path/to/my/data
$ dat login
$ dat create
$ dat publish</code></pre>
<p><a class="btn btn--green btn--full" href="http://docs.datproject.org/install">Install dat</a>
<a class="btn btn--green" href="http://docs.datproject.org/">Learn more</a></p>
        </div>
      </section>
    </div>`
}

module.exports = wrapper(publish)
