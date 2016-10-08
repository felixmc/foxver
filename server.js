module.exports = function initServer (appDir, configOverwrites) {
  console.log('Initializing server..') // eslint-disable-line no-console

  const Foxver = require('./lib')
  const app = new Foxver()

  app.init(appDir, configOverwrites)
    .then(App => {
      Log.info('Init OK')
      App.start()
    })
    .catch(err => {
      console.error('Init failed:', err) // eslint-disable-line no-console
    })

  return app
}
