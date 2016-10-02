const path = require('path')
const util = require('util')
const { EventEmitter } = require('events')

class Application {

  constructor () {
    // basic log
    this.log = {
      trace: console.log, // eslint-disable-line no-console
      debug: console.log, // eslint-disable-line no-console
      info: console.log, // eslint-disable-line no-console
      error: console.error, // eslint-disable-line no-console
    }

    global.Log = this.log

    this.config = {}
    this.modules = {}
    this.components = {}

    this.__dirname = path.resolve(__dirname, '..')

    this.setEnv(process.env.NODE_ENV)
  }

  setEnv (env) {
    env = (process.env.NODE_ENV || 'dev').toLocaleLowerCase()
    this.env = env === 'prod' || env === 'production' ? 'prod' : 'dev'
  }

  start (doneCallback) {
    this.emit('app:start')
  }

}

util.inherits(Application, EventEmitter)

module.exports = Application
