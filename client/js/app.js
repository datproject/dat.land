const choo = require('choo')
const persist = require('choo-persist')
const css = require('sheetify')
const defaults = require('./models/defaults')
const app = choo()

// define models:
var key = module.parent ? '' : window.location.origin
app.use(persist({ name: 'choo-hypertracker' + key }))
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
}
app.use(require('./defaults')(defaults))
app.use(require('./models/archive'))
app.use(require('./models/township'))
app.use(require('./models/profile'))
app.use(require('./models/message'))
app.use(require('./models/preview'))
app.use(require('./plugins/analytics'))

css('tachyons')
css('dat-colors')

// define routes:
app.route('/publish', require('./pages/publish'))
app.route('/register', require('./pages/auth/register'))
app.route('/login', require('./pages/auth/login'))
app.route('/reset-password', require('./pages/auth/reset-password'))
app.route('/404', require('./pages/fourohfour'))
app.route('/view', require('./pages/archive'))
app.route('/download/:archiveKey', require('./pages/download'))
app.route('/profile/edit', require('./pages/auth/edit-profile'))
app.route('/profile/delete', require('./pages/auth/delete-account'))
app.route('/dat://:archiveKey', require('./pages/archive'))
app.route('/dat://:archiveKey/contents', require('./pages/archive'))
app.route('/dat://:archiveKey/contents/*', require('./pages/archive'))
app.route('/:username/:dataset', require('./pages/archive'))
app.route('/:username/:dataset/*', require('./pages/archive'))
app.route('/:username', require('./pages/auth/profile'))
app.route('/', require('./pages/landing'))

app.defaults = defaults

if (module.parent) {
  module.exports = app
} else {
  app.mount('#app-root')
}
