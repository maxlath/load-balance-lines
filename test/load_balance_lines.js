require('should')
const { exec } = require('child_process')
const coreCount = require('os').cpus().length

const command = `export LBL_SILENT=true; ./bin/load-balance-lines ./test/assets/double_nums < ./test/assets/nums.ndjson`

describe('load-balance-lines', () => {
  it('should handle all the lines', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      expectedLinesCount(stdout, 100)
      done()
    })
  })

  it('should do the expected operation', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      expectedOperation(stdout, (100 * 49 + 50 + 100) * 2)
      done()
    })
  })

  it('should spawn one sub-process per core', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      expectedPidsCount(stdout)
      done()
    })
  })

  it('should accept a custom number of processes', done => {
    exec(`export LBL_PROCESSES=2; ${command}`, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      const outputLines = stdout.trim().split('\n')
      const pids = outputLines.reduce((pids, entry) => {
        const { pid } = JSON.parse(entry)
        pids[pid] = true
        return pids
      }, {})
      Object.keys(pids).length.should.equal(2)
      done()
    })
  })

  it('should work with large amount of data', function (done) {
    this.timeout(30000)
    const cmd = command.replace('nums.ndjson', 'many_nums.ndjson')
    exec(cmd, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      expectedLinesCount(stdout, 1000000)
      expectedOperation(stdout, (100 * 49 + 50 + 100) * 2 * 10000)
      expectedPidsCount(stdout)
      done()
    })
  })
})

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
