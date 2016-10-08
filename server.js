module.exports = function initServer (appDir) {
  console.log('Initializing server..') // eslint-disable-line no-console

  const Foxver = require('./lib')
  const app = new Foxver(appDir)

  app.init()
    .then(App => {
      Log.info('Init OK')
      App.start()
    })
    .catch(err => {
      console.error('Init failed:', err) // eslint-disable-line no-console
    })

  return app
}
