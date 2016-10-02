const {
  HttpError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  ServerError,
} = require('./http-error')

const parseErrMessage = (err) => {
  return err.error ? parseErrMessage(err.error) : (err && err.message)
}

const parseError = (error) => {
  let msg = 'Unknown Error'
  let status = 500

  if (error && (error instanceof Error || error.error)) {
    msg = parseErrMessage(error)
    status = error.status || status
  }

  return { msg, status }
}

module.exports = {
  // generic helpers
  format: function (data, statusCode = 200) {
    const body = { data }
    Log.trace({ res: { code: statusCode, body } })
    this.status(statusCode).json({ success: true, data })
  },

  handleError: function (error) {
    Log.debug('http err:', error, error instanceof HttpError)

    if (error instanceof HttpError) {
      this.status(error.code).json({ error: error.message, success: false })
    } else {
      const { msg, status } = parseError(error)
      this.status(status).json({ error: msg, success: false })
    }
  },

  // 200s
  ok: function (data) {
    this.format(data, 200)
  },

  created: function (data) {
    this.format(data, 201)
  },

  // 400s
  badRequest: (msg = 'Bad Request') => { throw new BadRequest(msg) },
  unauthorized: (msg = 'Unauthorized') => { throw new Unauthorized(msg) },
  forbidden: (msg = 'Forbidden') => { throw new Forbidden(msg) },
  notFound: (msg = 'Resource Not Found') => { throw new NotFound(msg) },

  // 500s
  serverError: (err = 'Server Error') => { throw new ServerError(err) },

  // combination
  okOrNotFound: function (data, msg) {
    if (data) {
      this.ok(data)
    } else {
      this.notFound(msg)
    }
  },
}
