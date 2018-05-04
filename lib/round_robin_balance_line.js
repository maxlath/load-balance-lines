// Writting lines on children's stdin in loop:
// every children take lines in turns, unless already too busy
// in which case a child can pass it's turn until ready to take more

const paused = {}
var pausedCount = 0
var childrenCount

module.exports = children => {
  childrenCount = children.length

  return function (line) {
    if (!line || line === '') return
    const nextChildren = getNextChildren(children)

    const ok = nextChildren.stdin.write(line + '\n')
    if (!ok) pauseChild(this, nextChildren)
  }
}

var turn = 0

const getNextChildren = children => {
  var nextChildren = children[turn]

  if (!nextChildren) {
    turn = 0
    return getNextChildren(children)
  }

  turn += 1

  if (paused[nextChildren.pid]) return getNextChildren(children)

  return nextChildren
}

const pauseChild = (parentStdin, child) => {
  const { pid } = child
  paused[pid] = true
  pausedCount++

  // Transmitting back pressure from children to the load balancer stdin
  // to prevent buffering
  // cf https://nodejs.org/api/stream.html#stream_event_drain
  if (pausedCount === childrenCount) parentStdin.pause()

  child.stdin.once('drain', () => {
    paused[pid] = false
    pausedCount--
    if (parentStdin.paused) parentStdin.resume()
  })
}
