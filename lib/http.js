const express = require('express')
const jwt = require('express-jwt')
const parser = require('body-parser')

const response = require('./helpers/response')

const Http = {
  init: (doneCallback) => {
    const config = App.config.http

    App.server = express()
    App.server.use(parser.json())

    App.server.use((req, res, next) => {
      Log.trace({ req })
      next()
    })

    if (config.jwt.active) {
      const jwtExceptions = [
        /^\/auth(\/.*)?$/,
      ].concat(config.jwt.exceptions)

      App.server.use(jwt({ secret: config.jwt.secret }).unless({ path: jwtExceptions }))
    }

    App.on('app:start', () => {
      App.server.listen(config.port, (err) => {
        if (err) {
          App.emit('app:error', err)
        } else {
          Log.info('%s v%s listening on port %s', App.name, App.version, config.port)
        }
      })
    })

    App.on('controllers:ready', () => {
      App.server.use((req, res) => {
        res.notFound()
      })

      // globally handle errors (especially useful for errors coming from external express midleware)
      App.server.use((err, req, res, next) => {
        res.handleError(err)
      })
    })

    // attach response helper methods to express response
    for (const method in response) {
      express.response[method] = response[method]
    }

    doneCallback()
  },
}

module.exports = Http
