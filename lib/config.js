const assign = require('assign-deep')
const { loadDir } = require('./helpers/loader')

const CONFIG_DIR = 'config'

exports.init = (configOverwrite = {}) => {
  const CONFIG_ROOT = App.resolvePath(CONFIG_DIR)

  App.config.package = require(App.resolvePath('package.json'))
  App.name = App.config.package.name
  App.version = App.config.package.version

  return loadDir(CONFIG_ROOT, { filter: { ext: ['.json', '.js'] } })
    .then(results => {
      results.forEach(result => {
        App.config[result.name] = result.module
      })
      App.config = assign(App.config, configOverwrite)
      App.emit('config:loaded')

      return App.config
    })
}
