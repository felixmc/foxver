class HttpError extends Error {
  constructor (msg = 'Unknown Http Error', code = 500) {
    super(msg)
    this.code = code
  }
}

class BadRequest extends HttpError {
  constructor (msg = 'Bad Request') {
    super(msg, 400)
  }
}

class Unauthorized extends HttpError {
  constructor (msg = 'Unauthorized') {
    super(msg, 401)
  }
}

class Forbidden extends HttpError {
  constructor (msg = 'Forbidden') {
    super(msg, 403)
  }
}

class NotFound extends HttpError {
  constructor (msg = 'Not Found') {
    super(msg, 404)
  }
}

class ServerError extends HttpError {
  constructor (msg = 'Server Error') {
    super(msg, 500)
  }
}

module.exports = {
  HttpError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  ServerError,
}
