var tape = require('tape')
var split = require('pull-randomly-split')
var pull = require('pull-stream')
var crypto = require('crypto')
var Reader = require('../')

var bytes = crypto.randomBytes(64)


tape('read once a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(32, function (err, data) {
    t.notOk(err)
    t.deepEqual(data, bytes.slice(0, 32))
    t.end()
  })

})

tape('read twice from a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(32, function (err, data) {

    console.log('read1', err, data)
    t.notOk(err)
    t.deepEqual(data, bytes.slice(0, 32))

    reader.read(16, function (err, data) {
      console.log('read2')
      t.notOk(err)
      t.deepEqual(data, bytes.slice(32, 48))
      t.end()
    })
  })

})

tape('read whatever is there', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  reader.read(null, function (err, data) {
    t.notOk(err)
    console.log(data)
    t.ok(data.length > 0)
    t.end()
  })

})

tape('read a stream', function (t) {

  var reader = Reader()

  pull(
    pull.values([bytes]),
    split(),
    reader
  )

  pull(
    reader.read(),
    pull.collect(function (err, data) {
      t.notOk(err)
      var _data = Buffer.concat(data)
      t.equal(_data.length, bytes.length)
      t.deepEqual(_data, bytes)
      t.end()
    })
  )

})
