const html = require('choo/html')
const url = require('url')
const querystring = require('querystring')
const header = require('./../../components/header')
const form = require('get-form-data')

function body (state, emit) {
  emit(state.events.DOMTITLECHANGE, 'Reset Password | datDirectory')
  // const authenticated = state.township.username
  var query = {}
  if (!module.parent) query = url.parse(window.location.href).query
  const { accountKey, resetToken, email } = querystring.parse(query)
  function onsubmitConfirm (e) {
    e.preventDefault()
    var data = form(e.target)
    if (data.newPassword !== data.otherPassword) return emit('message:error', 'Passwords do not match.')
    data.accountKey = accountKey
    data.resetToken = resetToken
    data.email = email
    emit('township:resetPasswordConfirmation', data)
  }

  function onsubmitEmail (e) {
    e.preventDefault()
    var data = form(e.target)
    emit('township:resetPassword', data.email)
  }

  if (accountKey && resetToken) {
    if (state.township.passwordResetConfirmResponse) {
      return html`
      <div>
        <div class="mw5 pv5 center">
          <h1 class="f4">Reset Your Password</h1>
          <p class="pa3 bg-yellow-disabled">
            ${state.township.passwordResetConfirmResponse}
          </p>
        </div>
      </div>`
    } else {
      return html`
      <div>
        <div class="mw5 pv5 center">
          <h1 class="f4">Reset Your Password</h1>
          <form action="" method="POST" id="password-reset-confirm-form" onsubmit=${onsubmitConfirm}>
            <p>
              <label for="newPassword" class="dat-input dat-input--icon">
                <input name="newPassword" type="password" placeholder="New password" class="dat-input__input dat-input__input--icon w-100" />
                <svg class="dat-input__icon">
                  <use xlink:href="#daticon-lock" />
                </svg>
              </label>
              <label for="otherPassword" class="dat-input dat-input--icon">
                <input name="otherPassword" type="password" placeholder="Confirm new password" class="dat-input__input dat-input__input--icon w-100" />
                <svg class="dat-input__icon">
                  <use xlink:href="#daticon-lock" />
                </svg>
              </label>
            </p>
            <input type="submit" class="btn btn--green btn--full w-100" value="Reset your password">
          </form>
        </div>
      </div>`
    }
  } else {
    if (state.township.passwordResetResponse) {
      return html`
      <div>
        <div class="mw5 pv5 center">
          <h1 class="f4">Reset Your Password</h1>
          <p class="pa3 bg-yellow-disabled">
            ${state.township.passwordResetResponse}
          </p>
        </div>
      </div>`
    } else {
      return html`
      <div>
        <div class="mw5 pv5 center">
          <h1 class="f4">Reset Your Password</h1>
          <form action="" method="POST" id="password-reset-form" onsubmit=${onsubmitEmail}>
            <p>
              <label for="email" class="dat-input dat-input--icon w-100">
                <input name="email" type="email" placeholder="Your E-mail" class="dat-input__input dat-input__input--icon w-100" />
                <svg class="dat-input__icon">
                  <use xlink:href="#daticon-letter" />
                </svg>
              </label>
            </p>
            <input type="submit" class="btn btn--green btn--full w-100" value="Reset your password">
          </form>
        </div>
      </div>`
    }
  }
}

module.exports = (state, emit) => {
  return html`
    <div class="landing">
      ${header(state, emit)}
      ${body(state, emit)}
    </div>`
}
