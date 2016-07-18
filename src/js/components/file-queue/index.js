var yo = require('yo-yo')

module.exports = FileQueue

function FileQueue (el) {
  if (!(this instanceof FileQueue)) return new FileQueue(el)
  this.$el = document.getElementById(el)
  this._queue = undefined
  this._component = this._render()

  if (this.$el) this.$el.appendChild(this._component)
}

FileQueue.prototype.update = function (state) {
  var self = this
  if (state && state.fileQueueReducer) {
    var updated = state.fileQueueReducer.queue

    // add listener
    if (updated && updated.writing && updated.writing.progressListener) {
      if (updated.writing) this._addProgressListenerCb(updated.writing)
      this._queue = updated
    }

    // updated, switch out listener
    if (this._queue && this._queue.writing &&
         (this._queue.writing.fullPath !== updated.writing.fullPath)) {
      // this._removeProgressListenerCb(this._queue.writing)
      this._addProgressListenerCb(updated.writing)
      this._queue = updated
    }

    console.log('[FileQueue] update() this._queue', this._queue)
    yo.update(this._component, this._render())
  }
}

FileQueue.prototype._addProgressListenerCb = function (file) {
  console.log('[FileQueue Component] _addProgressListenerCb(file)', file)
  var self = this
  // TODO: use a timeout before adding listner for less ui churn on small files
  if (file.progressListener) {
    file.progressListener.on('progress', function (progress) {
      file.progress = progress
      console.log(file.progress.percentage)
      yo.update(self._component, self._render())
    })
  }
}

FileQueue.prototype._removeProgressListenerCb = function (file) {
  console.log('TODO: _removeProgressListenerCb')
}

FileQueue.prototype._render = function () {
  var self = this
  if (this._queue && (this._queue.writing || this._queue.next.length > 0)) {
    return yo`<ul>
      ${this._queue.writing ? this._renderLi(this._queue.writing) : undefined}
      ${this._queue.next.map(function (file) {
        return self._renderLi(file)
      })}
      </ul>`
  }
  else {
    return yo`<ul></ul>`
  }
}

FileQueue.prototype._renderLi = function (file) {
  return yo`<li>
    ${file.fullPath}
    ${this._renderProgress(file)}
    </li>`
}

FileQueue.prototype._renderProgress = function (file) {
  var loaded = 0
  if (file && file.progress && file.progress.percentage) {
    loaded = parseInt(file.progress.percentage) // no decimal points, plz
    return yo`<div class="progress">
       <div class="progress__counter">${loaded}%</div>
       <div class="progress__bar">
         <div class="progress__line progress__line--loading"
              style="width: ${loaded}%">
         </div>
       </div>
     </div>`
  }
}