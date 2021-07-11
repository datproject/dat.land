const html = require('choo/html')
const relative = require('relative-date')
const prettyBytes = require('pretty-bytes')
const circle = require('./circle')
const css = require('sheetify')

module.exports = function hyperhealth (state, emit) {
  // TODO: display the circles in another tab called 'health'

  const data = state.archive.health
  if (!data) return ''
  var peers = data.peers.length
  // var completedPeers = data.completedPeers.length
  // var progressPeers = data.progressPeers.length

  function plural (num) {
    return num > 1 || num === 0 ? 's' : ''
  }

  var styles = css`
  .dat-details {
    padding-top: .75rem;
    padding-bottom: .25rem;
  }

  .dat-detail {
    display: inline-block;
    margin-right: 1rem;
    color: var(--color-neutral-60);
    @media only screen and (min-width: 40rem) {
      margin-right: 1.5rem;
    }
    p {
      margin-bottom: 0;
    }
  }
  `
  var parsedDate = relative(state.archive.updatedAt)

  return html`
  <div class="">
  <div class="${styles} dat-details">
    <div class="dat-detail">${prettyBytes(data.byteLength)}</div>
    <div class="dat-detail">${html`<span>${peers} source${plural(peers)} available</span>`}</div>
    <div class="dat-detail">
      updated ${parsedDate === '48 years ago' ? '?' : parsedDate}
    </div>
  </div>
    <div>
      ${data.peers.map((peer, i) => {
    const prog = (peer.have * 100) / peer.length
    if (!prog) return circle(prog)
  })}
      </div>
  </div>
  `
}
