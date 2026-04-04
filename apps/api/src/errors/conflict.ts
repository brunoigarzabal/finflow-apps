import { HttpError } from './http-error.js'

export class Conflict extends HttpError {
  constructor(message = 'Conflito') {
    super(409, message)
  }
}
