var process = require('process')
var net = require('net')
var path = require('path')
var browser2

function makeServer () {
  var server = net.createServer((c) => {
    browser2 = c
  }).on('error', (err) => {
    throw err
  })
  server.listen({ path: '/tmp/nightwatch-ipc.sock' }, () => {
  })
  return server
}

function makeClient () {
  var socket = net.connect({ path: '/tmp/nightwatch-ipc.sock' }, () => {
    socket.on('data', (data) => {
    })
  }).on('error', () => {
    console.error('not connected')
  })
  return socket
}

module.exports = new function () {
  var ipcServer, ipcClient
  var firstClient = process.env.__NIGHTWATCH_ENV_KEY.match(/_1$/)
  var testServer = process.env.TEST_SERVER || 'https://datbase.org'
  if (firstClient) {
    ipcServer = makeServer()
  } else {
    ipcClient = makeClient()
  }
  var testCases = this

  if (firstClient) {
    testCases.beforeEach = (browser, done) => {
      const check = () => {
        if (browser2) return done()
        setTimeout(check, 1000)
      }
      check()
    }

    testCases['opening the browser and navigating to the url'] = (client) => {
      client
        .url(testServer + 'browser')
        .click('.share-button').pause(1000)
        .expect.element('#title').text.matches(/^(.+)$/).before(10000)

      client.getText('#title', (result) => {
        console.log('sending', result.value)
        browser2.write(result.value)
      })
    }
  } else {
    testCases['opening the browser and navigating to the url'] = (client) => {
      client.pause(5000)
      ipcClient.once('data', (data) => {
        const datlink = data.toString()
        console.info('using datlink', datlink)
        client
          .url(testServer + 'dat://' + datlink)
          .waitForElementVisible('body', 10000)
      })
    }
  }

  testCases['found the other peer'] = (client) => {
    client
      .expect.element('#peers').text.matches(/1 Source\(s\)/).before(30000)
  }

  if (firstClient) {
    testCases['upload file'] = (client) => {
      client.setValue('#add-files input[type=file]', path.join(__dirname, '..', 'fixtures', 'dat.json'))
        .expect.element('#fs').text.to.contain('dat.json').before(10000)
    }
    testCases['archive size updates'] = (client) => {
      client.expect.element('#hyperdrive-size').text.to.contain('48 B').before(3000)
    }
  } else {
    testCases['file synced'] = (client) => {
      client
        .expect.element('#fs').text.to.contain('dat.json').before(10000)
    }
    testCases['archive size updates'] = (client) => {
      client.expect.element('#hyperdrive-size').text.to.contain('48 B').before(3000)
    }
  }

  if (firstClient) {
    testCases['upload file 2'] = (client) => {
      client.setValue('#add-files input[type=file]', path.join(__dirname, '..', 'fixtures', 'hello.csv'))
        .expect.element('#fs').text.to.contain('hello.csv').before(10000)
      client.expect.element('#hyperdrive-size').text.to.contain('64 B').before(3000)
    }
  } else {
    testCases['file 2 synced'] = (client) => {
      client
        .expect.element('#fs').text.to.contain('hello.csv').before(10000)
    }
  }

  testCases.suspend = (client) => {
    client.pause(1000)
  }

  testCases['metadata rendered'] = client => {
    client.expect.element('#title').text.to.contain('hello world').before(1000)
    client.expect.element('#author').text.to.contain('joe bob').before(1000)
  }

  testCases['file display opens'] = (client) => {
    client.click('.entry.file').pause(3000)
      .expect.element('#preview').to.have.attribute('class').which.contains('open').before(1000)
    client.expect.element('.dat-detail.size').text.to.contain('48 B').before(1000)
    client.frame(0).expect.element('pre').text.to.contain('hello world')
    client.frame(null)
    client.click('.panel-header__close-button').pause(1000)
      .expect.element('#preview').to.have.attribute('class').not.to.contain('open').before(1000)
  }

  if (firstClient) {
    testCases['create new button properly resets view'] = (client) => {
      client.click('.new-dat').pause(1000)
      client
        .click('.share-button').pause(1000)
        .expect.element('#fs').text.not.to.contain('dat.json').before(1000)
      client
        .expect.element('#author').text.not.to.contain('datapackage.json').before(1000)
      client
        .expect.element('#peers').text.matches(/0 Source\(s\)/).before(1000)
    }
  }

  testCases.after = (client, done) => {
    if (ipcServer) {
      ipcServer.close()
    }
    if (ipcClient) {
      ipcClient.end()
    }
    client.end().perform(function () { done() })
  }
}()
