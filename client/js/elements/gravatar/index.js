const xtend = require('xtend')
const html = require('choo/html')
const gravatar = require('gravatar')

module.exports = function (user, opts, cls) {
  if (!user || !user.email) return html``
  if (!opts) opts = {}
  if (!cls) cls = ''
  var _opts = xtend({ s: '200', r: 'pg', d: 'retro' }, opts)
  var url = gravatar.url(user.email, _opts)
  return html`
    <img class="${cls}" src="${url}" width=${_opts.s} height=${_opts.s} />
  `
}
