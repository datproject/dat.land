var fs = require('fs')
var path = require('path')
var testServer = process.env.TEST_SERVER || 'https://datbase.org'

module.exports = new function () {
  var key = fs.readFileSync(path.join(__dirname, '..', 'key.txt')).toString()
  var testCases = this
  testCases['Preview file when clicking on it'] = (client) => {
    client
      .url(testServer + '/install')
      .setValue("input[name='import-dat']", key)
    client.keys(client.Keys.ENTER, function (done) {
      client
        .expect.element('#fs').text.to.contain('dat.json').before(5000)
      client.click('.entry.file')
      client.pause(2000)
      client.expect.element('.panel-title.truncate').text.to.contain('dat.json')
      client.expect.element('.dat-detail.size').text.to.contain('48 B')
    })
  }
}()
