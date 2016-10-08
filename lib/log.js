// const path = require('path')
const bunyan = require('bunyan')
const colors = require('colors/safe')

const levels = {
  '10': {
    label: 'trace',
    color: 'white',
  },
  '20': {
    label: 'debug',
    color: 'cyan',
  },
  '30': {
    label: ' info',
    color: 'green',
  },
  '40': {
    label: ' warn',
    color: 'yellow',
  },
  '50': {
    label: 'error',
    color: 'red',
  },
  '60': {
    label: 'fatal',
    color: 'red',
  },
}

const consoleLog = { write: function (data) {
  const out = process.stdout

  const file = data.src.file.replace(App.config.__appdir + '/', '').split('.js')[0]

  const level = levels[data.level]
  const logData = data.msg || (data.err || data.req ? (data.req) : '')

  const time = new Date().toISOString().split('.')[0].replace('T', ' ')

  const levelLabel = colors[level.color].inverse(` ${level.label} `)
  const timestamp = colors.white.inverse(` ${time} `)
  const src = colors.yellow.inverse(` ${file}:${data.src.line} `)

  out.write(`${levelLabel}${timestamp}${src}\n${logData}\n\n`)
} }

exports.init = () => {
  const config = App.config.core.log

  global.Log = bunyan.createLogger({
    name: App.name,
    src: true,
    streams: [{
//      path: path.resolve(App.config.__appdir, App.config.log.path),
//      level: config.level,
//    }, {
      type: 'raw',
      level: config.level,
      stream: consoleLog,
    }],
    serializers: {
      req: (req) => {
        const body = req.body ? colors.yellow('\n body') + ' ' + JSON.stringify(req.body) : ''
        const user = req.user && (req.user.id + (req.user.username ? ' aka ' + req.user.username : ''))
        return colors.green(req.method) + ' ' + colors.blue(req.url) + ' user:' + user + body
      },
      res: (res) => {
        const body = res.body || {}
        const color = body.success ? colors.green : colors.red

        const data = body.data
                     ? Array.isArray(body.data)
                         ? 'Array[' + body.data.length + ']{' + body.data.map(o => o.id) + '}'
                         : JSON.stringify(body.data, null, '  ')
                     : body.error

        return `${color(res.code)}: ${data}`
      },
    },
  })

  App.log = Log

  return Log
}
