import { HttpError } from './http-error.js'

export class Unauthorized extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}
