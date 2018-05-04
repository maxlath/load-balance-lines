require('should')
const { exec } = require('child_process')
const { expectedLinesCount, expectedOperation, expectedPidsCount } = require('./utils/utils')

const command = `export LBL_SILENT=true; ./bin/load-balance-lines ./test/assets/double_nums < ./test/assets/nums.ndjson`

const largeInputCommand = command.replace('nums.ndjson', 'many_nums.ndjson')
const maxBuffer = 50 * 1024 * 1024

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
    exec(largeInputCommand, { maxBuffer }, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      expectedLinesCount(stdout, 1000000)
      expectedOperation(stdout, (100 * 49 + 50 + 100) * 2 * 10000)
      expectedPidsCount(stdout)
      done()
    })
  })
})
