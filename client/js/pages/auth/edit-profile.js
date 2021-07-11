const html = require('choo/html')
const css = require('sheetify')
const form = require('get-form-data')
const header = require('./../../components/header')

var prefix = css`
  :host {
    textarea {
      min-height: 7rem;
    }
  }
`

module.exports = (state, emit) => {
  emit(state.events.DOMTITLECHANGE, 'Edit Profile | datDirectory')

  function onSubmit (e) {
    const data = form(e.target)
    data.id = state.township.profile.id
    emit('profile:edit', data)
    return false
  }

  var profile = state.township.profile
  return html`
    <div class="edit-profile ${prefix}">
      ${header(state, emit)}
      <div class="mw5 pv5 center">
        <h3 class="f4">Edit your Profile</h3>
        <form onsubmit=${onSubmit}>
          <p>
            <label for="name" class="dat-input dat-input--icon w-100">
              <input name="name" type="text" value=${profile.name || ''} placeholder="Full Name" class="dat-input__input dat-input__input--icon w-100" />
              <svg class="dat-input__icon">
                <use xlink:href="#daticon-happy-dat" />
              </svg>
            </label>
          </p>
          <p>
            <label for="username" class="dat-input dat-input--icon w-100">
              <input name="username" type="text" value=${profile.username || ''} placeholder="Username" class="dat-input__input dat-input__input--icon w-100" />
              <svg class="dat-input__icon">
                <use xlink:href="#daticon-file" />
              </svg>
            </label>
          </p>
          <p>
            <label for="email" class="dat-input dat-input--icon w-100">
              <input name="email" type="text" value=${profile.email || ''} placeholder="Email" class="dat-input__input dat-input__input--icon w-100" />
              <svg class="dat-input__icon">
                <use xlink:href="#daticon-letter" />
              </svg>
            </label>
          </p>
          <p>
            <label for="description" class="dat-input w-100">
              <textarea rows="4" name="description" placeholder="Description" class=" w-100 pa2" >${profile.description}</textarea>
            </label>
          </p>
          <p class="flex items-center justify-between w-100">
            <input type="submit" value="Save Profile" class="w100 btn btn--green btn--full" />
          </p>
          <p class="flex items-center justify-between w-100">
            <a href="/reset-password" class="mr3 btn btn--green">Change my password</a>
          </p>
          <p class="flex items-center justify-between w-100">
            <a href="/profile/delete" class="mr3 btn btn--red">Delete my account</a>
          </p>
        </form>
      </div>
    </div>`
}
