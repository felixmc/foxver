const path = require('path')
const { loadDir } = require('./helpers/loader')

const SERVICES_DIR = 'app/services'

const ServicesComponent = {

  init: doneCallback => {
    ServicesComponent.loadServices(doneCallback)
  },

  // loads service modules from /services/ directory and store them in global object
  loadServices: doneCallback => {
    App.modules.services = {}
    global.Services = {}

    loadDir(path.resolve(App.__dirname, SERVICES_DIR))
      .then(results => {
        results.forEach(result => {
          App.modules.services[result.name] = result.module
          Services[result.name] = result.module()
        })
        doneCallback()
      })
      .catch(doneCallback)
  },
}

module.exports = ServicesComponent
