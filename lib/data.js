const vasync = require('vasync')

const { loadDir } = require('./helpers/loader')

const PROVIDERS_DIR = 'providers'
const MODELS_DIR = 'models'

const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

const Data = {

  init: function (doneCallback) {
    App.data = { connections: {}, models: {} }

    vasync.pipeline({
      funcs: [
        Data.loadProviders,
        Data.loadModels,
        (_, callback) => {
          vasync.forEachParallel({
            func: (conKey, callback) => {
              const conn = App.data.connections[conKey]

              const conConfig = App.config.data.connections[conKey]
              const provider = App.modules.providers[conConfig.provider]

              if (provider.modelsReadyHook) {
                provider.modelsReadyHook(conn, callback)
              } else {
                callback(null)
              }
            },
            inputs: Object.keys(App.data.connections),
          }, callback)
        },
      ],
    }, doneCallback)

    App.on('data:models:loaded', () => {
      global.Models = App.data.models
    })
  },

  // loads provider classes
  loadProviders: function loadProviders (_, doneCallback) {
    App.modules.providers = {}
    App.config.data.providers = {}

    loadDir(App.resolvePath(PROVIDERS_DIR))
      .then(results => {
        results.forEach((result) => {
          App.config.data.providers[result.name] = []
          App.modules.providers[result.name] = result.module
        })

        // iterate over connections and store them in config indexed by provider
        for (const connectionName in App.config.data.connections) {
          const connection = App.config.data.connections[connectionName]
          if (!connection.disabled) {
            const providers = App.config.data.providers[connection.provider] || []
            providers.push(connectionName)
            App.config.data.providers[connection.provider] = providers
          }
        }

        App.emit('data:providers:ready')
        doneCallback()
      })
      .catch(doneCallback)
  },

  loadModels: function loadModels (_, doneCallback) {
    App.modules.models = {}
    global.Models = {}

    loadDir(App.resolvePath(MODELS_DIR))
      .then(results => {
        const modelConfig = App.config.data.models

        results.forEach((result) => {
          if (result.module.provider || App.config.data.defaultProvider) {
            result.module.provider = result.module.provider || App.config.data.defaultProvider

            // load model modules
            App.modules.models[result.name] = result.module

            // Log.debug('initializing model', result.name)
            Data.initModel(result, modelConfig[result.name])
          } else {
            App.emit('data:models:error', { model: result, error: `Model ${result.name} has no provider defined` })
          }
        })
        App.emit('data:models:loaded')
        App.emit('data:models:ready')
        doneCallback()
      })
      .catch(doneCallback)
  },

  getConnection: function getOrInitConnection (connectionName) {
    if (!App.data.connections[connectionName]) {
      const connection = App.config.data.connections[connectionName]
      const provider = App.modules.providers[connection.provider]
      App.data.connections[connectionName] = provider.init(connection)
    }

    return App.data.connections[connectionName]
  },

  initModel: function initModel (model, config) {
    // if has config and config has connection, use that, else try grab default connection for model provider

    const providerConnections = App.config.data.providers[model.module.provider]
    const connection = config && config.connection ? config.connection : (providerConnections.length && providerConnections[0])

    if (connection && !connection.disabled) {
      const provider = Data.getConnection(connection)
      App.data.models[capitalize(model.name)] = model.module.init(provider)
      if (model.module.onModelsReady) {
        App.on('data:models:loaded', model.module.onModelsReady.bind(null, provider))
      }
    } else {
      App.emit('data:models:error', { model: model, error: `Model ${model.name} has no valid provider connection` })
    }
  },

}

module.exports = Data
