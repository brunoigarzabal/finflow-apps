import { HttpError } from './http-error.js'

export class BadRequest extends HttpError {
  constructor(message = 'Bad request') {
    super(400, message)
  }
}
