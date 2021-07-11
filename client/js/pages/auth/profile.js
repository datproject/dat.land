const html = require('choo/html')
const fourohfour = require('../../elements/404')
const css = require('sheetify')
const gravatar = require('./../../elements/gravatar')
const header = require('./../../components/header')
const list = require('./../../components/list')

var profileStyles = css`
  :host {
    min-height: calc(100vh - 4rem);
  }
`

var avatarStyles = css`
  :host {
    display: block;
    margin: 0 auto;
    height: auto;
    box-shadow: 0 0 1.5rem rgba(0,0,0,.15);
  }
`

function placeholder () {
  return html`
    <section class="section" id="publish">
      <div class="container">
        <div class="col-xs-12 col-sm-5 flex flex-column justify-center">
          <h2>Welcome to Dat!</h2>
          <h1>You have not published any dats.</h1>
          <h4><a class="btn btn--green btn--full" href="/publish">Publish Now</a></h4>
        </div>
      </div>
    </section>
  `
}

module.exports = (state, emit) => {
  if (state.error) {
    emit(state.events.DOMTITLECHANGE, 'Error | datBase')
    return html`
    <div>
      ${header(state, emit)}
      ${fourohfour()}
    </div>
    `
  }
  emit(state.events.DOMTITLECHANGE, `${state.profile.username} | datBase`)

  var username = state.profile.username
  var email = state.profile.email
  var name = state.profile.name
  var numDats = state.profile.dats.length
  var description = state.profile.description
  var pic = gravatar({ email }, {}, avatarStyles)
  var owner = state.township.profile.username === state.profile.username
  var showPlaceholder = numDats === 0 && owner

  state.profile.dats.map(function (dat) {
    dat.shortname = `${state.profile.username}/${dat.name}`
    return dat
  })
  return html`
    <div>
      ${header(state, emit)}
      <div class="flex flex-column flex-row-m flex-row-l ${profileStyles}  bg-splash-02">
        <div class="bg-neutral-04 pa4 tc tl-m tl-l">
          <div class="name">
            <h1 class="f4 mb1">${name}</h1>
            <h2 class="f5 color-neutral-80">${username}</h2>
            ${pic}
          </div>
          <h3 class="pt2 f5">
            ${description}
          </h3>
        </div>
        <div class="pa4 flex-auto">
          <h3 class="f5">
            ${showPlaceholder ? placeholder() : html`<div>${username} has published ${numDats} dats</div>`}
          </h3>
          ${list(state.profile.dats, emit)}
        </div>
      </div>
    </div>
   `
}
