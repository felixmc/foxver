const path = require('path')
const vasync = require('vasync')

const Application = require('./app')
const { loadDir } = require('./helpers/loader')

const COMPONENTS_DIR = 'lib/'

class AppCore {

  // setup application core
  setup () {
    global.App = new Application()
  }

  initConfig (configOverwrite) {
    return require('./config').init(configOverwrite)
  }

  initLog () {
    return require('./log').init()
  }

  initComponent (component, callback) {
    App.components[component.name] = component.module
    component.module.init(err => {
      App.emit('component:init', component.name)
      callback(err)
    })
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

  // init core components
  init (configOverwrite = {}) {
    this.setup()

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

}

module.exports = AppCore
