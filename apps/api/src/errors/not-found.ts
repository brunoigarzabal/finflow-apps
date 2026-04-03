import { HttpError } from './http-error.js'

export class NotFound extends HttpError {
  constructor(message = 'Not found') {
    super(404, message)
  }
}
