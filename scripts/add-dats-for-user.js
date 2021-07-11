const Api = require('dat-registry')
const hyperdrive = require('hyperdrive')
const ram = require('random-access-memory')

var rootUrl = 'http://localhost:8080'
var email = process.argv[2]
var password = process.argv[3]
var api = Api({ server: rootUrl, apiPath: '/api/v1' })

function createDat (dat) {
  var archive = hyperdrive(ram)
  archive.ready(function () {
    dat.url = 'dat://' + archive.key.toString('hex')
    api.dats.create(dat, function (err, resp, json) {
      if (err) console.error(err.toString())
      console.log('json')
    })
  })
}

api.login({ email, password }, function (err, resp, json) {
  if (err) console.error('err', err.toString())
  createDat({ name: 'cats', description: 'meow these are cats', keywords: 'meow, cats, grass, mice, scratching' })
  createDat({ name: 'dogs', description: 'yo these are dogs', keywords: 'dogs, love, cuddles, running, eating' })
})
