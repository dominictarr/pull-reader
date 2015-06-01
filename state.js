

module.exports = function () {

  var soFar = new Buffer(0)

  return {
    data: soFar,
    add: function (data) {
      if(!Buffer.isBuffer(data))
        throw new Error('data must be a buffer, was: ' + JSON.stringify(data))
      this.data = soFar = Buffer.concat([soFar, data])
      return this
    },
    has: function (n) {
      if(null == n) return soFar.length > 0
      return soFar.length - (n || 0) >= 0
    },
    get: function (n) {
      var next
      if(null == n) {
        next = soFar
        soFar = new Buffer(0)
        return next
      }
      next = soFar.slice(0, n)
      if(soFar.length < n) throw new Error('current length is:'+soFar.length + ', could not get:'+n + ' bytes')
      soFar = soFar.slice(n, soFar.length)
      return next
    }
  }

}
