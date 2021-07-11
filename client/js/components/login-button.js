const html = require('choo/html')
const css = require('sheetify')
const button = require('../elements/button')
const gravatar = require('../elements/gravatar')

var avatarStyles = css`
  :host {
    display: block;
    width: 2.25em;
    height: 2.25em;
    vertical-align: middle;
    border: 2px solid var(--color-white);
    background-color: var(--color-pink);
    margin: auto;
    &:hover, &:focus {
      border-color: var(--color-green);
    }
  }
`

module.exports = function (state, emit) {
  if (state) return html`` // always true
  // Hide login button
  //
  if (module.parent || !state.township.whoami) return html``
  if (state.township.email) {
    return html`
      ${button({
    text: gravatar({ email: state.township.email }, {}, avatarStyles),
    click: () => emit('township:sidePanel'),
    klass: 'btn bn pr0'
  })}
    `
  } else {
    return html`
      ${button({
    text: 'Log In',
    click: function () { window.location.href = '/login' },
    klass: 'btn btn--full btn--green'
  })}
    `
  }
}
