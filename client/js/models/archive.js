const memdb = require('memdb')
const hyperdrive = require('hyperdrive')
const level = require('level-browserify')
const swarm = require('hyperdrive-archive-swarm')
const ram = require('random-access-memory')
const raf = require('random-access-file-reader')
const path = require('path')
const hyperdriveImportQueue = require('hyperdrive-import-queue')
const drop = require('drag-drop')

var noop = function () {}
var drive

function getDrive () {
  if (!drive) drive = hyperdrive(level('dat.land'))
  return drive
}

module.exports = {
  namespace: 'archive',
  state: {
    key: null,
    file: null,
    error: null,
    size: null,
    numPeers: 0,
    entries: [],
    instance: null,
    signalhubs: [
      'signalhub.mafintosh.com',
      'signalhub.dat.land'
    ],
    importQueue: {
      writing: null,
      next: []
    }
  },
  reducers: {
    update: (data, state) => {
      return data
    },
    updatePeers: (data, state) => {
      return {numPeers: state.swarm.connections}
    },
    updateImportQueue: (data, state) => {
      // shallow copy the last `state` frame so we can preserve
      // file.progressListener refs:
      var stateCopy = {}
      stateCopy.writing = state.importQueue.writing
      stateCopy.next = state.importQueue.next
      // new file is enqueued:
      if (data.onQueueNewFile) stateCopy.next.push(data.file)
      // next file begins writing:
      if (data.onFileWriteBegin) {
        stateCopy.writing = stateCopy.next[0]
        stateCopy.next = stateCopy.next.slice(1)
      }
      // write progress on current file writing:
      if (data.writingProgressPct && data.writing && data.writing.fullPath) {
        if (stateCopy.writing && (stateCopy.writing.fullPath === data.writing.fullPath)) {
          stateCopy.writing.progressPct = data.writingProgressPct
        }
      }
      // current file is done writing:
      if (data.onFileWriteComplete) {
        stateCopy.writing = null
      }
      return {
        importQueue: {
          writing: stateCopy.writing,
          next: stateCopy.next
        }
      }
    }
  },
  subscriptions: [
    (send, done) => {
      drop(document.body, (files) => send('archive:importFiles', {files}, done))
    }
  ],
  effects: {
    new: function (data, state, send, done) {
      drive = getDrive()
      const archive = drive.createArchive(null, {
        live: true,
        sparse: true,
        file: ram
      })
      const key = archive.key.toString('hex')
      send('archive:update', {instance: archive, swarm: swarm(archive), key: key}, noop)
      send('archive:import', key, done)
    },
    import: function (data, state, send, done) {
      const location = '/' + data
      send('location:setLocation', { location }, done)
      window.history.pushState({}, null, location)
      send('archive:update', {entries: {}}, noop)
      send('archive:load', data, done)
    },
    importFiles: function (data, state, send, done) {
      if (data.createArchive || !state.instance) {
        send('archive:new', null, () => send('archive:importFiles', {files}, done))
        return
      }
      var files = data.files
      var filesByName = {}
      for (var i in files) {
        var file = files[i]
        filesByName[file.name] = file
      }
      console.log(filesByName)
      drive = getDrive()
      const archive = drive.createArchive(state.instance.key, {
        live: true,
        sparse: true,
        file: function (name) {
          console.log(name, filesByName[name])
          return raf(filesByName[name])
        }
      })
      archive.open(function () {
        if (!archive.owner) {
          // XXX: use error in state
          window.alert('You can not put files in this archive')
          return done()
        }
        if (!Array.isArray(files)) {
          // arrayify FileList
          files = Array.prototype.slice.call(files, 0)
          for (var i in files) {
            files[i].fullPath = '/' + files[i].name
          }
        }
        hyperdriveImportQueue(files, archive, {
          cwd: state.cwd || '',
          progressInterval: 100,
          onQueueNewFile: function (err, file) {
            if (err) console.log(err)
            send('archive:updateImportQueue', {onQueueNewFile: true, file: file}, noop)
          },
          onFileWriteBegin: function (err, file) {
            if (err) console.log(err)
            send('archive:updateImportQueue', {onFileWriteBegin: true}, noop)
          },
          onFileWriteComplete: function (err, file) {
            if (err) console.log(err)
            if (file && file.progressListener && file.progressHandler) {
              file.progressListener.removeListener('progress', file.progressHandler)
            }
            send('archive:updateImportQueue', {onFileWriteComplete: true}, noop)
          },
          onCompleteAll: function () {}
        })
      })
    },
    load: function (key, state, send, done) {
      var archive, sw
      if (state.instance && state.instance.drive) {
        if (state.instance.key.toString('hex') === key) {
          archive = state.instance
          sw = state.swarm
        } else {
          archive = null
        }
      }
      if (!archive) {
        send('archive:update', {key}, noop)
        drive = getDrive()
        archive = drive.createArchive(key)
        sw = swarm(archive)
        send('archive:update', {instance: archive, swarm: sw, key}, done)
      }
      sw.on('connection', function (conn) {
        send('archive:updatePeers', noop)
        conn.on('close', function () {
          send('archive:updatePeers', noop)
        })
      })
      archive.on('upload', function (data) {
        send('archive:update', {uploaded: data.length + (state.uploaded || 0)}, noop)
      })
      archive.on('download', function (data) {
        send('archive:update', {downloaded: data.length + (state.downloaded || 0)}, noop)
      })
      archive.open(function () {
        if (archive.content) {
          archive.content.get(0, function (data) {
            send('archive:update', {size: archive.content.bytes}, noop)
            // XXX: Hack to fetch a small bit of data so size properly updates
          })
        }
        var stream = archive.list({live: true})
        var entries = {}
        stream.on('data', function (entry) {
          entries[entry.name] = entry
          var dir = path.dirname(entry.name)
          if (!entries[dir]) {
            entries[dir] = {
              type: 'directory',
              name: dir,
              length: 0
            }
          }
          const size = archive.content.bytes
          send('archive:update', {entries, size}, noop)
        })
      })
    },
    readFile: function (data, state, send, done) {
      var archive = state.instance
      var readStream = archive.createFileReadStream(data.entryName)
      done(readStream)
    }
  }
}
