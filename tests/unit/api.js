const test = require('tape')
const TownshipClient = require('township-client')
const request = require('request')
const xtend = require('xtend')
const helpers = require('../helpers')
const Config = require('../../server/config')
const fs = require('fs')
const path = require('path')
const datKey = fs.readFileSync(path.join(__dirname, '..', 'key.txt')).toString()
var config = JSON.parse(JSON.stringify(Config()))

var rootUrl = 'http://localhost:' + config.port
var api = rootUrl + '/api/v1'
test('api', function (t) {
  helpers.server(config, function (close) {
    var users = JSON.parse(JSON.stringify(helpers.users))
    var dats = JSON.parse(JSON.stringify(helpers.dats))

    var client = TownshipClient({
      server: api,
      config: config.townshipClient
    })

    t.end()

    test('api POST users should fail', function (t) {
      request.post({ url: api + '/users', body: users.joe, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.statusCode, 400)
        t.end()
      })
    })

    test('api GET users should fail without login', function (t) {
      request({ url: api + '/users', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.statusCode, 400)
        t.end()
      })
    })

    test('api GET dats should pass without login', function (t) {
      request({ url: api + '/dats', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body, [], 'zero dats')
        t.end()
      })
    })

    test('api should register users', function (t) {
      client.register(users.joe, function (err, resp, body) {
        t.ifError(err)
        users.joe.id = body.id
        t.same(body.email, users.joe.email, 'email the same')
        t.same(body.username, users.joe.username, 'username the same')
        t.ok(body.token, 'token there')
        client.register(users.bob, function (err, resp, body) {
          t.ifError(err)
          users.bob.id = body.id
          t.same(body.email, users.bob.email)
          t.ok(body.token, 'token there')
          client.register(users.admin, function (err, resp, body) {
            t.ifError(err)
            users.admin.id = body.id
            t.same(body.email, users.admin.email, 'gives back email upon register')
            t.ok(body.token, 'token there')
            t.end()
          })
        })
      })
    })
    test('api usernames should be unique', function (t) {
      client.register(users.joe, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'error status code')
        t.end()
      })
    })

    test('api id should not update even after a failure ', function (t) {
      client.secureRequest({ url: '/users?id=' + users.joe.id, method: 'GET', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 1, 'joe is still there')
        t.same(body[0].id, users.joe.id, 'same id in body and joe')
        t.end()
      })
    })

    test('api should get the users we created', function (t) {
      client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 3, 'has three users')
        if (body.length) {
          t.same(body[0].email, users.joe.email, 'has joe')
          t.same(body[1].email, users.bob.email, 'has bob')
          t.same(body[2].email, users.admin.email, 'has admin')
        }
        t.end()
      })
    })

    test('api joe should be able to update himself', function (t) {
      client.logout(function () {
        client.login(users.joe, function (err, resp, body) {
          t.ifError(err)
          t.same(body.email, users.joe.email, 'has joes email')
          t.ok(body.token, 'has token')
          t.ok(body.key, 'has key')
          t.same(body.username, users.joe.username, 'has username')
          client.secureRequest({ url: '/users', method: 'PUT', body: { id: users.joe.id, description: 'this is a new description' }, json: true }, function (err, resp, body) {
            t.ifError(err)
            t.same(body.updated, 1, 'updated one user')
            client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
              t.ifError(err)
              t.same(body.length, 3, 'has three users')
              if (body.length) t.same(body[0].description, 'this is a new description', 'user has new description')
              t.end()
            })
          })
        })
      })
    })
    test('api joe cannot update bob', function (t) {
      client.secureRequest({ url: '/users', method: 'put', body: { id: users.bob.id, email: 'joebob@email.com' }, json: true }, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 3, 'has three users')
          if (body.length) t.same(body[1].email, users.bob.email, 'bob has the same email')
          t.end()
        })
      })
    })

    test('api joe cannot delete bob', function (t) {
      client.secureRequest({ method: 'DELETE', url: '/users', body: { id: users.bob.id }, json: true }, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 3, 'has three users')
          t.end()
        })
      })
    })

    test('api can create a dat', function (t) {
      dats.cats.url = datKey
      client.secureRequest({ method: 'POST', url: '/dats', body: dats.cats, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.cats.id = body.id
        dats.cats.user_id = body.user_id
        client.secureRequest({ url: '/dats', json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 1)
          t.end()
        })
      })
    })

    test('api can get a dat', function (t) {
      client.secureRequest({ url: '/dats?id=' + dats.cats.id, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 1, 'has one dat')
        if (body.length) t.same(body[0].name, dats.cats.name, 'is the right dat')
        t.end()
      })
    })

    test('api can update a dat thats mine using POST', function (t) {
      dats.cats.description = 'this is a new description'
      client.secureRequest({ url: '/dats', body: dats.cats, method: 'POST', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.updated, 1)
        t.end()
      })
    })

    test('api dats need to have correct names', function (t) {
      var bad = Object.assign({}, dats.penguins)
      bad.url = datKey
      bad.name = 'this is a bad name'
      client.secureRequest({ method: 'POST', url: '/dats', body: bad, json: true }, function (err, resp, body) {
        t.ok(err)
        t.ok(err.message.indexOf('name pattern mismatch') > -1, 'has pattern mismatch error')
        t.end()
      })
    })

    test('api can get a dat by username/dataset combo', function (t) {
      client.secureRequest({ url: `/${users.joe.username}/${dats.cats.name}`, json: true }, function (err, resp, user) {
        t.ifError(err)
        t.same(user.name, dats.cats.name, 'is the right dat')
        t.end()
      })
    })

    test('api can get a dat by username/dataset combo without login', function (t) {
      request({ url: `${rootUrl}/${users.joe.username}/${dats.cats.name}`, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(resp.headers['hyperdrive-key'], dats.cats.url, 'has url')
        t.end()
      })
    })

    test('api can create another dat', function (t) {
      dats.penguins.url = datKey
      client.secureRequest({ method: 'POST', url: '/dats', body: dats.penguins, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.penguins.id = body.id
        dats.penguins.user_id = body.user_id
        client.secureRequest({ url: '/dats', json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 2)
          t.end()
        })
      })
    })

    test('api can get dats with limit and offset', function (t) {
      client.secureRequest({ url: '/dats?limit=1&offset=1', json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.length, 1, 'has one dat')
        t.same(body[0].name, dats.penguins.name, 'is the right dat')
        t.end()
      })
    })

    test('api cannot delete a dat that doesnt exist', function (t) {
      client.secureRequest({ method: 'DELETE', url: '/dats', body: { id: 'notanid' }, json: true }, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        t.end()
      })
    })

    test('api bob cannot delete joes dat', function (t) {
      client.logout(function () {
        client.login(users.bob, function (err) {
          t.ifError(err)
          client.secureRequest({ method: 'DELETE', url: '/dats', body: { id: dats.cats.id }, json: true }, function (err, resp, body) {
            t.ok(err)
            t.same(err.statusCode, 400, 'request denied')
            t.end()
          })
        })
      })
    })

    test('api bob cannot update joes dat using POST', function (t) {
      client.secureRequest({ method: 'POST', url: '/dats', body: { id: dats.cats.id, name: 'hax00rs' }, json: true }, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({ url: '/dats?id=' + dats.cats.id, json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 1, 'got the dat')
          t.same(body[0].name, dats.cats.name, 'name is the same')
          t.end()
        })
      })
    })

    test('api bob cannot update joes dat', function (t) {
      client.secureRequest({ method: 'PUT', url: '/dats', body: { id: dats.cats.id, name: 'hax00rs' }, json: true }, function (err, resp, body) {
        t.ok(err)
        t.same(err.statusCode, 400, 'request denied')
        client.secureRequest({ url: '/dats?id=' + dats.cats.id, json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 1, 'got the dat')
          t.same(body[0].name, dats.cats.name, 'name is the same')
          t.end()
        })
      })
    })

    test('api bob can delete his own dat', function (t) {
      dats.dogs.url = datKey
      client.secureRequest({ method: 'POST', url: '/dats', body: dats.dogs, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.ok(body.id, 'has an id')
        dats.dogs.id = body.id
        dats.dogs.user_id = body.user_id
        t.same(body.name, dats.dogs.name, 'is the right dat')
        client.secureRequest({ method: 'DELETE', url: '/dats', body: { name: dats.dogs.name }, json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.deleted, 1, 'deletes one row')
          client.secureRequest({ url: '/dats', json: true }, function (err, resp, body) {
            t.ifError(err)
            t.same(body.length, 2, 'only two dat')
            t.end()
          })
        })
      })
    })

    test('api bob can delete himself', function (t) {
      client.secureRequest({ method: 'DELETE', url: '/users', body: { id: users.bob.id }, json: true }, function (err, resp, body) {
        t.ifError(err)
        t.same(body.deleted, 1, 'deletes one row')
        client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
          t.ok(err)
          t.same(err.statusCode, 400, 'once bob is gone he cant use the api')
          t.end()
        })
      })
    })

    test('api no trace of bob after deletion', function (t) {
      client.login(users.joe, function (err) {
        t.ifError(err)
        client.secureRequest({ url: '/users', json: true }, function (err, resp, body) {
          t.ifError(err)
          t.same(body.length, 2, 'has two users')
          t.end()
        })
      })
    })

    test('api should allow password reset', function (t) {
      client.secureRequest({
        url: '/password-reset',
        body: { email: users.joe.email },
        method: 'POST',
        json: true
      }, function (err, resp, body) {
        t.ifError(err)
        const sent = config.email.mailer.transporter.sentMail
        t.same(sent.length, 1)
        t.same(sent[0].data.to, users.joe.email)
        const [, urlstring] = sent[0].message.content.match(/href="(.*?)"/)
        const { query } = require('url').parse(urlstring, 1)
        const goodQuery = xtend(query, { newPassword: 'foobar' })
        const brokenQuery = xtend(goodQuery, { resetToken: 'zzz' })
        client.secureRequest({
          url: '/password-reset-confirm',
          body: brokenQuery,
          method: 'POST',
          json: true
        }, function (err, resp, body) {
          t.same(err.statusCode, 400)
          t.same(err.message, 'reset token not valid')
          client.secureRequest({
            url: '/password-reset-confirm',
            body: goodQuery,
            method: 'POST',
            json: true
          }, function (err, resp, body) {
            t.ifError(err)
            /* XXX: verify joe's password is updated */
            t.end()
          })
        })
      })
    })

    test('tear down', function (t) {
      client.logout(function () {
        helpers.tearDown(config, function () {
          close(function () {
            t.end()
          })
        })
      })
    })
  })
})
