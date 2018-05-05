const { LBL_VERBOSE } = process.env
const verbose = LBL_VERBOSE != null

module.exports = {
  log: (...args) => {
    if (verbose) console.log(...args)
  },

  logAndExit: err => {
    console.error(err)
    process.exit(1)
  },

  closeChildren: children => () => {
    children.forEach(child => child.stdin.end())
  },

  exitOnChildExit: exitCode => {
    // Wait a bit for other children to have a chance to exit themselves
    // before the parent calls the end
    setTimeout(() => {
      if (exitCode !== 0) process.exit(exitCode)
    }, 500)
  }
}
