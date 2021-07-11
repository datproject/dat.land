const xtend = require('xtend')
const http = require('nets')
const api = require('../api')()

module.exports = function (state, emitter) {
  emitter.on('archive:update', function (data) {
    state.archive = xtend(state.archive, data)
    emitter.emit('render')
  })

  emitter.on('archive:directory', function (root) {
    var path = root === '.' ? '' : `/contents/${root}`
    emitter.emit('pushState', `/dat://${state.archive.key}${path}`)
    emitter.emit('archive:update', { root: root })
  })

  emitter.on('archive:health', function (data) {
    http({ url: `/health/${state.archive.key}`, method: 'GET', json: true }, function (err, resp, json) {
      if (err) console.error(err)
      emitter.emit('archive:update', { health: json })
    })
  })

  emitter.on('archive:getMetadata', function (data) {
    if (!state.archive.key || state.archive.fetching) return
    state.archive.fetching = true
    http({ url: `/metadata/${state.archive.key}?timeout=${data.timeout}`, method: 'GET', json: true }, function (err, resp, json) {
      json.fetching = false
      json.retries = state.archive.retries + 1
      if (err) return emitter.emit('archive:update', xtend({ error: { message: err.message } }, json))
      if (json.error) return emitter.emit('archive:update', json)
      if (json.entries) json.error = null
      emitter.emit('archive:update', json)
    })
  })
  emitter.on('archive:delete', function (data) {
    api.dats.delete({ id: data.id }, function (err, resp, json) {
      if (err) return emitter.emit('archive:update', { error: { message: err.message } })
      emitter.emit('pushState', '/profile')
    })
  })
  emitter.on('archive:view', function (link) {
    window.location.href = '/view?query=' + link
  })
}
