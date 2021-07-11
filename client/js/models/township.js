const Api = require('../api')
const xtend = require('xtend')
const defaults = require('./defaults')

module.exports = function (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    emitter.emit('township:whoami', {})
  })
  var api = Api()

  emitter.on('township:update', function (data) {
    state.township = xtend(state.township, data)
    state.township.whoami = true
    emitter.emit('render')
  })

  emitter.on('township:sidePanel', function (data) {
    state.township.sidePanel = state.township.sidePanel === 'hidden' ? '' : 'hidden'
    emitter.emit('render')
  })

  emitter.on('township:whoami', function (data) {
    const user = api.whoami()
    if (user.username) {
      api.users.get({ username: user.username }, function (err, resp, results) {
        if (err && err.message === 'jwt expired') {
          emitter.emit('township:logout', data)
          return done()
        }
        if (!results.length) return done()
        var newState = user
        newState.profile = results[0]
        api.dats.get({ user_id: user.id }, function (err, resp, results) {
          if (err && err.message === 'jwt expired') {
            emitter.emit('township:logout', data)
            return done()
          }
          newState.dats = results
          newState.whoami = true
          emitter.emit('township:update', newState)
        })
      })
    } else done()
    function done () {
      emitter.emit('township:update', {})
    }
  })

  emitter.on('township:logout', function (data) {
    api.logout(data, function (err, resp, data) {
      if (err) return emitter.emit('township:update', { error: err.message })
      emitter.emit('township:update', defaults.township)
      emitter.emit('message:success', 'Successfully Logged Out')
    })
  })

  emitter.on('township:login', function (data) {
    api.login(data, function (err, resp, data) {
      if (err) return emitter.emit('township:update', { error: err.message })
      data.login = 'hidden'
      emitter.emit('township:update', data)
      window.location.href = '/' + data.username
    })
  })

  emitter.on('township:register', function (data) {
    api.register(data, function (err, resp, data) {
      if (err) return emitter.emit('township:error', { error: err.message })
      data.register = 'hidden'
      emitter.emit('township:update', data)
      window.location.href = '/profile/edit'
    })
  })

  emitter.on('township:resetPassword', function (data) {
    var email = data || state.township.account.auth.basic.email
    api.users.resetPassword({ email }, function (err, res, body) {
      if (err) return emitter.emit('township:error', err.message)
      emitter.emit('township:update', { passwordResetResponse: body.message })
    })
  })

  emitter.on('township:resetPasswordConfirmation', function (data) {
    api.users.resetPasswordConfirmation(data, function (err, res, body) {
      if (err) return emitter.emit('township:error', err.message)
      emitter.emit('township:update', { passwordResetConfirmResponse: body.message, passwordResetResponse: null })
    })
  })

  emitter.on('township:error', function (err) {
    state.township.error = err.error
    emitter.emit('render')
  })
}
