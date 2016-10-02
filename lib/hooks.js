const path = require('path')
const { loadDir } = require('./helpers/loader')

const HOOKS_DIR = 'app/hooks'

const HooksComponent = {

  init: (doneCallback) => {
    HooksComponent.loadHooks()
      .then(() => {
        const { hooks } = App.config

        // bind hooks to events
        for (const event in hooks) {
          // grab event names from config and retrive the hook module with that name
          hooks[event]
            .forEach(hookName => {
              const hook = App.modules.hooks[hookName]
              App.on(event, hook)
            })
        }

        App.emit('hooks:ready')
        doneCallback()
      })
      .catch(doneCallback)
  },

  // loads hooks modules from app/hooks directory and initializes them
  loadHooks: () => {
    App.modules.hooks = {}

    return loadDir(path.resolve(App.__dirname, HOOKS_DIR))
      .then(results => {
        results.forEach(result => {
          App.modules.hooks[result.name] = result.module
        })

        App.emit('hooks:loaded')
      })
  },

}

module.exports = HooksComponent
