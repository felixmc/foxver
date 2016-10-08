const path = require('path')
const util = require('util')
const { EventEmitter } = require('events')

const appDirGuess = path.resolve(__dirname, '../../..')

class Application {

  constructor (appDir) {
    // basic log
    this.log = {
      trace: console.log, // eslint-disable-line no-console
      debug: console.log, // eslint-disable-line no-console
      info: console.log, // eslint-disable-line no-console
      error: console.error, // eslint-disable-line no-console
    }

    global.Log = this.log

    this.config = {
      __appdir: appDir || appDirGuess,
    }
    this.modules = {}
    this.components = {}

    this.__dirname = path.resolve(__dirname, '..')

    this.setEnv(process.env.NODE_ENV)
  }

  setEnv (env) {
    env = (process.env.NODE_ENV || 'dev').toLocaleLowerCase()
    this.env = env === 'prod' || env === 'production' ? 'prod' : 'dev'
  }

  srcPath (...segments) {
    return path.resolve(this.__appdir, ...segments)
  }

  resolvePath (...segments) {
    return path.resolve(this.__dirname, ...segments)
  }

  start (doneCallback) {
    this.emit('app:start')
  }

}

util.inherits(Application, EventEmitter)

module.exports = Application
