const api = require('../api')()
const xtend = require('xtend')
const defaults = require('./defaults')

module.exports = function (state, emitter) {
  emitter.on('profile:update', function (data) {
    state.profile = xtend(state.profile, data)
    emitter.emit('render')
  })

  emitter.on('profile:delete', function (data) {
    api.users.delete(data, function (err, resp, json) {
      if (err) return emitter.emit('township:update', { error: err.message })
      emitter.emit('profile:update', { profile: defaults.profile })
      emitter.emit('township:logout')
      window.location.href = '/'
    })
  })

  emitter.on('profile:edit', function (data) {
    api.users.update(data, function (err, resp, json) {
      if (err) return emitter.emit('township:update', { error: err.message })
      emitter.emit('township:update', { profile: data })
      emitter.emit('message:success', 'Profile edited successfully!')
    })
  })

  emitter.on('profile:get', function (data) {
    api.users.get(data, function (err, resp, json) {
      if (err) return emitter.emit('message:error', err.message)
      if (!json.length) return emitter.emit('message:error', 'User not found.')
      var user = json[0]
      api.dats.get({ user_id: user.id }, function (err, resp, results) {
        if (err) return emitter.emit('message:error', err.message)
        user.dats = results
        emitter.emit('profile:update', user)
      })
    })
  })
}
