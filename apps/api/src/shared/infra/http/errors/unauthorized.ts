import { HttpError } from './http-error.js'

export class Unauthorized extends HttpError {
  constructor(message = 'Não autorizado') {
    super(401, message)
  }
}
