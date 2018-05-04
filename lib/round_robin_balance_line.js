var turn = 0

// Writting line on children's stdin in loop:
// all children should get the same amount of lines.

module.exports = children => function (line) {
  if (!line || line === '') return
  var nextChildren = children[turn]
  if (nextChildren) {
    turn += 1
  } else {
    nextChildren = children[0]
    turn = 1
  }
  // Transmitting back pressure from children to the load balancer stdin
  // to prevent buffering
  // cf https://nodejs.org/api/stream.html#stream_event_drain
  const ok = nextChildren.stdin.write(line + '\n')
  if (!ok) {
    this.pause()
    nextChildren.stdin.once('drain', this.resume.bind(this))
  }
}
