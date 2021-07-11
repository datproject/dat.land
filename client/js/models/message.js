module.exports = function (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    emitter.emit('message:clear')
  })
  emitter.on('message:update', function (data) {
    state.message = { message: data.message, type: data.type }
    emitter.emit('render')
  })
  emitter.on('message:clear', function (data) {
    state.message = { message: '', type: '' }
    emitter.emit('render')
  })

  emitter.on('message:new', function (data) {
    emitter.emit('message:update', data)
    setTimeout(function () {
      emitter.emit('message:clear')
    }, 4000)
  })

  emitter.on('message:success', function (message) {
    emitter.emit('message:new', { message: message, type: 'success' })
  })
  emitter.on('message:error', function (message) {
    emitter.emit('message:new', { message: message, type: 'error' })
  })
  emitter.on('message:warning', function (message) {
    emitter.emit('message:new', { message: message, type: 'warning' })
  })
}
