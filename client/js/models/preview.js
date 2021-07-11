var xtend = require('xtend')
var defaults = require('./defaults')

module.exports = function (state, emitter) {
  emitter.on('preview:update', function (data) {
    state.preview = xtend(state.preview, data)
    emitter.emit('render')
  })

  emitter.on('preview:openPanel', function (data) {
    emitter.emit('preview:update', { isPanelOpen: true, error: null })
  })

  emitter.on('preview:file', function (data) {
    data.error = false
    emitter.emit('preview:update', data)
    emitter.emit('pushState', `/dat://${data.entry.archiveKey}/contents/${data.entry.name}`)
    emitter.emit('preview:openPanel')
  })

  emitter.on('preview:closePanel', function (data) {
    var arr = state.preview.entry.name.split('/')
    var path = arr.splice(0, arr.length - 1)
    emitter.emit('pushState', `/dat://${state.preview.entry.archiveKey}/contents/${path}`)
    emitter.emit('preview:update', defaults.preview)
  })
}
