
var State = require('./state')

function isInteger (i) {
  return Number.isFinite(i)
}

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function () {

  var queue = [], read, reading = false, state = State(), ended, streaming

  function drain () {
    console.log(queue.length, state.data.length)
    while (queue.length) {
      if(null == queue[0].length && state.has(1)) {
        queue.shift().cb(null, state.get())
      }
      else if(state.has(queue[0].length)) {
        var next = queue.shift()
        next.cb(null, state.get(next.length))
      }
      else if(ended)
        queue.shift().cb(ended)
      else
        return !!queue.length
    }
    //always read a little data
    return queue.length || !state.has(1)
  }

  function more () {
    var d = drain()
    console.log('MORE?', d, queue.length, state.data.length)
    if(d && !reading)
    if(read && !reading && !streaming) {
      reading = true
      read(null, function (err, data) {
        reading = false
        if(err) {
          ended = err
          return drain()
        }
        state.add(data)
        more()
      })
    }
  }

  function reader (_read) {
    read = _read
    more()
  }

  reader.read = function (len, cb) {
    if(isFunction(cb)) {
      queue.push({length: isInteger(len) ? len : null, cb: cb})
      more()
    }
    else {
      //switch into streaming mode for the rest of the stream.
      streaming = true
      //wait for the current read to complete
      return function (abort, cb) {
        //if there is anything still in the queue,
        if(reading || state.has(1)) {
          queue.push({length: null, cb: cb})
          more()
        }
        else
          console.log('simple stream'), read(abort, cb)
      }
    }
  }

  return reader
}

