const html = require('choo/html')
const datIcon = require('../icon')
const loaderIcon = require('../loader-icon')

module.exports = function (props) {
  if (!props) props = {}
  props.header = props.header || '404'
  props.body = props.body || 'Is the link correct?'
  props.onclick = props.onclick || ''
  props.linkText = props.linkText || 'Take me home'
  var button = ''
  if (props.link) {
    button = html`<p class="mb4">
     <button onclick="${props.onclick}"
        class="btn btn--large btn--green btn--full take-me-home"
        href="/">${props.linkText}</button>
    </p>`
  }
  var icon
  if (props.icon) {
    icon = datIcon(props.icon, { class: 'w3' })
  } if (props.icon === 'loader') {
    icon = loaderIcon()
  } else {
    icon = datIcon('sad-dat', { class: 'w3 color-green' })
  }

  return html`
    <div class="error-page">
      <div class="mb3">
        ${icon}
      </div>
      <h3>${props.header}</h3>
      <p class="mb3">${props.body}</p>
      ${button}
     </div>
   `
}
