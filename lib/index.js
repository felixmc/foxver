const path = require('path')
const vasync = require('vasync')

const Application = require('./app')
const { loadDir } = require('./helpers/loader')

const COMPONENTS_DIR = 'lib/'

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

    return new Promise((resolve, reject) => {
      loadDir(path.resolve(App.__dirname, COMPONENTS_DIR), options)
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
    App.components[component.name] = component.module
    component.module.init(err => {
      App.emit('component:init', component.name)
      callback(err)
    })
  }
}

module.exports = AppCore
