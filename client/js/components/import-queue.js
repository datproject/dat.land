const html = require('choo/html')

module.exports = (state, emit) => {
  const writing = state.importQueue.writing
  const writingProgressPct = state.importQueue.writingProgressPct
  const next = state.importQueue.next

  return render()

  function render () {
    if (writing || next.length > 0) {
      return html`<table id="import-queue">
        ${writing ? renderLi(writing, writingProgressPct) : null}
        ${next.map(function (file) {
    return renderLi(file, null)
  })}
      </table>`
    } else {
      return html`<table id="import-queue"></table>`
    }
  }

  function renderLi (file, progressPct) {
    return html`<tr>
      <td class="name">${file.fullPath}</td>
      <td>${renderProgress(file, progressPct)}</td>
    </tr>`
  }

  function renderProgress (file, progressPct) {
    if (file.importError) {
      return html`<div class="progress error">Error</div>`
    }
    var loaded = progressPct || 0
    var klass = loaded === 100 ? 'progress__line--complete' : 'progress__line--loading'
    return html`<div class="progress">
       <div class="progress__counter">
        ${loaded}%
      </div>
       <div class="progress__bar">
         <div class="progress__line ${klass}" style="width: ${loaded}%">
         </div>
       </div>
     </div>`
  }
}
