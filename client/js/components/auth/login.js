const html = require('choo/html')
const css = require('sheetify')
const form = require('get-form-data')

const login = (state, emit) => {
  function onSubmit (e) {
    const data = form(e.target)
    emit('township:login', data)
    e.preventDefault()
    return false
  }

  var styles = css`
    :host {
      .error {
        font-size: .875rem;
        font-weight: normal;
        color: $color-red;
      }
    }
  `

  return html`<div class="${styles} login">
    <div class="mw5 pv6 center">
      <h1 class="f4">Log In</h1>
      <form onsubmit=${onSubmit}>
        <div class="error">${state.township.error}</div>
        <p>
          <label for="email" class="dat-input dat-input--icon w-100">
            <input name="email" type="email" placeholder="E-mail" class="dat-input__input dat-input__input--icon w-100" />
            <svg class="dat-input__icon">
              <use xlink:href="#daticon-letter" />
            </svg>
          </label>
        </p>
        <p>
          <label for="password" class="dat-input dat-input--icon w-100">
            <input name="password" type="password" placeholder="Password" class="dat-input__input dat-input__input--icon w-100" />
            <svg class="dat-input__icon">
              <use xlink:href="#daticon-lock" />
            </svg>
          </label>
        </p>
        <p>
          <input type="submit" value="Log In" class="btn btn--green btn--full w-100" />
        </p>
        <p class="f7">
          <a href="/reset-password" class="mr3">Forgot Password?</a>
          <a href="/register">No Account yet? Register »</a>
        </p>
      </form>
    </div>
  </div>`
}

module.exports = login
