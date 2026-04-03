import { HttpError } from './http-error.js'

export class Conflict extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message)
  }
}
