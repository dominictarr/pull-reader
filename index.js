'use strict'
var State = require('./state')

function isInteger (i) {
  return Number.isFinite(i)
}

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function (timeout) {

  var queue = [], read, readTimed, reading = false
  var state = State(), ended, streaming, abort

  function maxDelay(fn, delay) {
    return function (a, cb) {
      var timer
      if (delay) {
        timer = setTimeout(function () {
          fn(new Error('pull-reader: read exceeded timeout'), cb)
        }, delay)
      }
      fn(a, function (err, value) {
        if (delay) clearTimeout(timer)
        if (err === true && state.read < state.total) {
          return cb(new Error('attempted to read '+state.wants+' of '+state.total+' bytes'))
        }
        cb(err, value)
      })
    }
  }

  function drain () {
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
    return queue.length || !state.has(1) || abort
  }

  function more () {
    var d = drain()
    if(d && !reading)
    if(read && !reading && !streaming) {
      reading = true
      readTimed (null, function (err, data) {
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
    if(abort) {
      while(queue.length) queue.shift().cb(abort)
      return cb && cb(abort)
    }
    readTimed = maxDelay(_read, timeout)
    read = _read
    more()
  }

  reader.abort = function (err, cb) {
    abort = err || true
    if(read) {
      reading = true
      read(abort, function () {
        while(queue.length) queue.shift().cb(abort)
        cb && cb(abort)
      })
    }
    else
      cb()
  }

  reader.read = function (len, _timeout, cb) {
    if(isInteger(len)) {
      state.wants += len
    }
    if(isFunction(_timeout))
      cb = _timeout, _timeout = timeout
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
          if(abort) return read(abort, cb)
          queue.push({length: null, cb: cb})
          more()
        }
        else
          maxDelay(read, _timeout)(abort, function (err, data) {
            cb(err, data)
          })
      }
    }
  }

  return reader
}
