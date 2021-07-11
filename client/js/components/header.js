const html = require('choo/html')
const css = require('sheetify')
const panel = require('./auth/user-panel')
const importButton = require('../elements/import-button')
const loginButton = require('../components/login-button')
const message = require('../elements/message')

const logoCss = css`
  :host {
    img {
      transition: transform .5s ease-in-out;
      width: inherit;
    }
    &:hover, &:focus {
      img {
        transform: rotate(360deg);
      }
    }
  }
`

module.exports = function (state, emit) {
  return html`
    <header>
      ${message(state.message)}
      <nav class="bg-white bb b--neutral-10 dt w-100 border-box pa2 ph4-l">
        <div class="dtc v-mid w-75">
          <a class="${logoCss} v-mid dib link dim mr2 w2 h2" href="/" title="DatBase">
            <img src="/public/img/dat-hexagon.svg" alt="Dat Logo">
          </a>
          <a class="mr3 v-mid link dim color-neutral hover-color-neutral b f5 f3-ns dib-ns dn" href="/" title="datBase">dat<span class="color-neutral-60">Directory</span></a>
          ${importButton(emit)}
          <a href="http://docs.datproject.org" class="ml3 link dim color-neutral ttu tracked f6 f5-ns dib">Docs</a>
          <a href="http://datproject.org" class="ml3 link dim color-neutral ttu tracked f6 f5-ns dib-l dn">Home</a>
        </div>
        <div class="dtc v-mid w-25 tr">
          ${state.township.email ? html`<a href="/publish" class="dib-ns dn btn btn--green">Publish</a>` : ''}
          <div class="dib">
            ${loginButton(state, emit)}
          </div>
          ${panel(state, emit)}
        </div>
      </nav>
    </header>
  `
}
