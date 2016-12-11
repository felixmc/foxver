const path = require('path')
const vasync = require('vasync')

const Application = require('./app')
const { loadDir } = require('./helpers/loader')

class AppCore {

  // init core components
  init (appDir, configOverwrite = {}) {
    this.setup(appDir)

    return this.initConfig(configOverwrite)
      .then(() => this.initLog())
      .then(() => this.loadComponents(App.config.core.components.active))
      .then(() => {
        App.emit('app:ready')
        return App
      })
      .catch(err => {
        Log.error('Error starting application:', err.stack)
        App.emit('app:error', err)
        throw err
      })
  }

  // setup application core
  setup (appDir) {
    global.App = new Application(appDir)
  }

  initConfig (configOverwrite) {
    return require('./config').init(configOverwrite)
  }

  initLog () {
    return require('./log').init()
  }

  // load components listed in config into application
  loadComponents (components) {
    const options = {
      whitelist: App.config.core.components.active,
    }

    Log.trace('Preparing to initialize components..', App.config.core.components.active)

    return new Promise((resolve, reject) => {
      loadDir(path.resolve(__dirname), options)
        .then(results => {
          vasync.forEachPipeline({
            inputs: results,
            func: this.initComponent,
          }, (err, results) => {
            if (err) reject(err)
            else resolve(App.components)
          })
        }, reject)
    })
  }

  initComponent (component, callback) {
    Log.trace('Initing component', component.name)
    App.components[component.name] = component.module

    // set timeout so that we don't wait forever for a component to init
    // a component could crash silently and never trigger the callback :(
    const waitTimeout = setTimeout(() => {
      callback(new Error(`Component ${component.name} took longer than 2s to initialize`))
    }, 2000)

    component.module.init(err => {
      clearTimeout(waitTimeout)
      App.emit('component:init', component.name)
      callback(err)
    })
  }
}

module.exports = AppCore
