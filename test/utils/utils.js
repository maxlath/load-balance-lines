const coreCount = require('os').cpus().length

const expectedLinesCount = (stdout, expected) => {
  getOutputLines(stdout).length.should.equal(expected)
}

const expectedOperation = (stdout, expectedTotal) => {
  const total = getOutputLines(stdout).reduce((total, entry) => {
    total += JSON.parse(entry).double
    return total
  }, 0)
  total.should.equal(expectedTotal)
}

const expectedPidsCount = stdout => {
  const pids = getOutputLines(stdout).reduce((pids, entry) => {
    const { pid } = JSON.parse(entry)
    pids[pid] = true
    return pids
  }, {})
  Object.keys(pids).length.should.equal(coreCount)
}

const getOutputLines = stdout => stdout.trim().split('\n')

module.exports = { expectedLinesCount, expectedOperation, expectedPidsCount }
