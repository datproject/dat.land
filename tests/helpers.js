const fs = require('fs')
const rimraf = require('rimraf')
const Server = require('../server')

module.exports = {
  server: function (config, cb) {
    const server = Server(config)
    server.listen(config.port, function () {
      cb(server.close.bind(server))
    })
  },
  tearDown: function (config, close) {
    rimraf(config.township.db, function () {
      fs.unlink(config.db.connection.filename, function () {
        close()
      })
    })
  },
  users: {
    joe: { name: 'joe schmo', username: 'joe', password: 'very secret', email: 'hi@joe.com', description: 'hello i am a description', token: null, role: 'user' },
    bob: { name: 'bob smob', username: 'bob', password: 'so secret', email: 'hi@bob.com', description: 'i like it', token: null, role: 'user' },
    admin: { name: 'pam spam', username: 'pam', password: 'secret123', email: 'hi@pam.com', description: 'i dont eat it', token: null, role: 'admin' }
  },
  dats: {
    cats: { name: 'cats', title: 'all of the cats', description: 'live on the corner of washington and 7th', keywords: 'furry, fluffy' },
    penguins: { name: 'penguins', title: 'all of the penguins', description: 'lives in your house', keywords: 'sloppy, loud' },
    dogs: { name: 'dogs', title: 'all of the dogs', description: 'lives in your house', keywords: 'sloppy, loud' }
  }
}
