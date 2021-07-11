const html = require('choo/html')
const importQueue = require('../../components/import-queue')
const hyperdrive = require('../../components/hyperdrive')
const copyButton = require('../../components/copy-button')
const header = require('../../components/header')
const preview = require('../../components/preview')
const permissions = require('../../elements/permissions')
const fourohfour = require('../../elements/404')
const addFiles = require('../../elements/add-files')
const error = require('../../elements/error')
const hyperdriveStats = require('../../elements/hyperdrive-stats')
const prettyBytes = require('pretty-bytes')

const archivePage = (state, emit) => {
  // XXX: have an error enum?
  if (state.archive.error && state.archive.error.message === 'Invalid key') {
    var props = {
      header: 'No dat here.'
    }
    return html`
    <div>
      ${header(state, emit)}
      ${fourohfour(props)}
    </div>
    `
  }
  var archive = state.archive.instance
  var health = state.archive.health
  var swarm = state.archive.swarm // webrtc swarm
  var webrtcPeers = swarm ? swarm.connections : 0
  var sources = webrtcPeers + health.connected
  var bytes = archive && archive.content ? archive.content.bytes
    : health ? health.bytes : 0
  var size = prettyBytes(bytes)
  var downloadBtnDisabled = webrtcPeers > 0 ? '' : 'display:none;'

  return html`
    <div>
      ${header(state, emit)}
      <div id="dat-info" class="dat-header">
        <div class="container">
          <div class="dat-header-actions-wrapper">
            ${copyButton(state.archive.key, emit)}
            <button class="dat-header-action" onclick=${() => emit('archive:downloadAsZip')} style=${downloadBtnDisabled}>
              <div class="btn__icon-wrapper ${downloadBtnDisabled}">
                <svg><use xlink:href="#daticon-open-in-desktop" /></svg>
                <span class="btn__icon-text">Download</span>
              </div>
            </button>
            <a href="https://github.com/datproject/dat-desktop" target="_blank" class="dat-header-action">
              <div class="btn__icon-wrapper">
                <img src="/public/img/open-in-desktop.svg" class="btn__icon-img">
                <span class="btn__icon-text">Open in Desktop App</span>
              </div>
            </a>
          </div>
          <div id="title" class="share-link">${state.archive.metadata.title || state.archive.key}</div>
          <div id="author" class="author-name">${state.archive.metadata.author}</div>
          ${error(state.archive.error)}
          <div class="dat-details">
            <div id="permissions" class="dat-detail">
              ${permissions({ owner: archive ? archive.owner : false })}
            </div>
            <div id="hyperdrive-size" class="dat-detail"><p class="size">${size}</p></div>
            <div id="peers" class="dat-detail">${sources} Source(s)</div>
            <div id="speed" class="dat-detail dn"><div>${hyperdriveStats({ downloaded: state.archive.downloadSpeed, uploaded: state.archive.uploadSpeed })}</div></div>
          </div>
            <div class="dat-detail">
            ${archive && archive.owner ? 'Data is deleted once the browser tab is closed.' : ''}
            </div>
        </div>
      </div>
      <main class="site-main">
        <div class="container">
          <div id="add-files">${archive && archive.owner ? addFiles({ onfiles: (files) => emit('archive:importFiles', { files }) }) : ''}</div>
          ${importQueue(state, emit)}
          ${hyperdrive(state, emit)}
        </div>
      </main>
      <div class="status-bar">
        <div class="container">
          <span id="help-text" class="status-bar-status"></span>
          ${(state.archive.downloadTotal || state.archive.uploadTotal)
    ? html`<div id="hyperdrive-stats" class="status-bar-stats">
                Total: ${hyperdriveStats({ downloaded: state.archive.downloadTotal, uploaded: state.archive.uploadTotal })}
              </div>`
    : ''}
        </div>
      </div>
      ${preview(state, emit)}
    </div>`
}

module.exports = archivePage
