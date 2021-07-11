const html = require('choo/html')
const header = require('./../../components/header')
const form = require('get-form-data')

module.exports = (state, emit) => {
  function onsubmitConfirm (e) {
    e.preventDefault()
    var data = form(e.target)
    if (data.email !== state.township.email) emit('message:error', 'Incorrect email.')
    else emit('profile:delete', { id: state.township.profile.id })
    return false
  }

  return html`
    <div class="landing">
      ${header(state, emit)}
      <div class="mw5 pv5 center">
        <h3>Delete your account</h3>

        <p><b>This action CANNOT be undone.</b>  </p>
        <p>This will permanently delete the <b>${state.township.profile.username}</b> user account, profile information, and dats.</p>

        <p>If you want to delete your account, please enter the email associated with your account below.</p>

        <form onsubmit=${onsubmitConfirm}>
          <p>
            <label for="email" class="dat-input dat-input--icon w-100">
              <input name="email" type="text" value='' placeholder="Email" class="dat-input__input dat-input__input--icon w-100" />
              <svg class="dat-input__icon">
                <use xlink:href="#daticon-letter" />
              </svg>
            </label>
          </p>

          <input type="submit" class="btn btn--full btn--red" value='Delete my account'>
        </form>
      </div>
  </div>`
}
