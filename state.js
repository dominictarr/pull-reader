
module.exports = function () {

  var buffers = [], length = 0
  return {
    length: length,
    data: this,
    add: function (data) {
      if(!Buffer.isBuffer(data))
        throw new Error('data must be a buffer, was: ' + JSON.stringify(data))
      this.length = length = length + data.length
      buffers.push(data)
      return this
    },
    has: function (n) {
      if(null == n) return length > 0
      return length - (n || 0) >= 0
    },
    get: function (n) {
      if(n == null || n === length) {
        length = 0
        var _buffers = buffers
        buffers = []
        return Buffer.concat(_buffers)
      } else if(n <= length) {
        var out = [], len = 0
        while((len + buffers[0].length) <= n) {
          var b = buffers.shift()
          len += b.length
          out.push(b)
        }
        if(len < n) {
          out.push(buffers[0].slice(0, n - len))
          buffers[0] = buffers[0].slice(n - len, buffers[0].length)
          this.length = length = length - n
        }
        return Buffer.concat(out)
      }
    }
  }

}
