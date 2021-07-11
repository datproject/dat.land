const hyperdriveRenderer = require('./client.js')
const path = require('path')
const noop = function () {}

module.exports = function (state, emit) {
  var lookup = {}
  var updated = null // last modified date
  for (var i in state.archive.entries) {
    var entry = state.archive.entries[i]
    if (!updated) updated = new Date(entry.mtime)
    else {
      var compare = new Date(entry.mtime)
      if (updated.getTime() < compare.getTime()) updated = compare
    }
    if (entry.name[0] === '/') entry.name = entry.name.substring(1, entry.name.length)
    lookup[entry.name] = entry
    var dir = path.dirname(entry.name)
    if (!lookup[dir]) {
      lookup[dir] = {
        type: 'directory',
        name: dir,
        length: 0
      }
    }
  }
  emit('archive:update', { updatedAt: updated })
  var vals = Object.keys(lookup).map(key => lookup[key])
  var onclick = (ev, entry) => {
    if (entry.type === 'directory') {
      emit('archive:directory', entry.name)
      return true
    } else {
      entry.archiveKey = state.archive.key
      emit('preview:file', { entry: entry }, noop)
      return false
    }
  }

  return hyperdriveRenderer(state.archive.root, vals, onclick)
}
