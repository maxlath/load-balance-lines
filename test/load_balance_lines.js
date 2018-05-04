require('should')
const { exec } = require('child_process')
const coreCount = require('os').cpus().length

const command = `export LBL_SILENT=true; ./bin/load-balance-lines ./test/assets/double_nums < ./test/assets/nums.ndjson`

const expectedTotal = 100 * 49 + 50 + 100

describe('load-balance-lines', () => {
  it('should handle all the lines', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      const outputLines = stdout.trim().split('\n')
      outputLines.length.should.equal(100)
      done()
    })
  })

  it('should do the expected operation', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      const outputLines = stdout.trim().split('\n')
      const total = outputLines.reduce((total, entry) => {
        total += JSON.parse(entry).double
        return total
      }, 0)
      total.should.equal(expectedTotal * 2)
      done()
    })
  })

  it('should spawn one sub-process per core', done => {
    exec(command, (err, stdout, stderr) => {
      if (err) return done(err)
      if (stderr) return done(stderr)
      const outputLines = stdout.trim().split('\n')
      const pids = outputLines.reduce((pids, entry) => {
        const { pid } = JSON.parse(entry)
        pids[pid] = true
        return pids
      }, {})
      Object.keys(pids).length.should.equal(coreCount)
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
})
