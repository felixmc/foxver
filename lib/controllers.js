const { loadDir } = require('./helpers/loader')

const CONTROLLER_DIR = 'controllers'

const Controllers = {
  init: doneCallback => {
    Controllers.loadControllers(doneCallback)
  },

  // loads controller modules from app/controllers directory and initializes them as express routes
  loadControllers: doneCallback => {
    App.modules.controllers = {}
    App.controllers = {}

    loadDir(App.srcPath(CONTROLLER_DIR), { recursive: true })
      .then(results => {
        results.forEach(result => {
          App.modules.controllers[result.name] = result.module
          App.controllers[result.name] = result.module()

          if (App.config.http.controllers.autoroute) {
            Controllers.initController(result, App.controllers[result.name])
          }
        })

        Controllers.mapRoutes()
        App.emit('controllers:ready')
        doneCallback()
      }, doneCallback)
  },

  mapRoutes: () => {
    const routes = App.config.http.controllers.routes || {}

    for (let route in routes) {
      const destination = routes[route]
      const routeParts = route.split(' ')
      let methods = ['GET', 'POST', 'PUT', 'DEL']

      if (routeParts.length > 1) {
        methods = [routeParts[0]]
        route = routeParts[1]
      }

      let conName
      let actName = '/'

      if (destination[0] === '/') {
        const destParts = destination.split('/')
        conName = destParts[1]
        actName += destParts[2]
      } else {
        const destParts = destination.split('.')
        conName = destParts[0].toLowerCase()
        if (destParts.length > 1) {
          actName += destParts[1]
        }
      }

      const controller = App.controllers[conName]
      const action = controller && controller[actName]

      if (action) {
        methods.forEach((method) => {
          method = method.toLowerCase()

          const handler = typeof action === 'function' ? action : action[method]
          if (handler) {
            App.server[method](route, handler)
          }
        })
      }
    }
  },

  // takes a controller module and initializes the express routes from it (basically maps controller function properties to express route callbacks)
  initController: (result, controller) => {
    const path = '/' + result.name

    for (const route in controller) {
      // makes / at the beginning of route optional
      const routePath = path + (route[0] === '/' ? '' : '/') + route

      if (typeof controller[route] === 'function') {
        App.server.get(routePath, controller[route])
      } else {
        for (const method in controller[route]) {
          App.server[method](routePath, controller[route][method])
        }
      }
    }
  },

}

module.exports = Controllers
