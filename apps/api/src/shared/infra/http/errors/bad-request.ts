import { HttpError } from './http-error.js'

export class BadRequest extends HttpError {
  constructor(message = 'Requisição inválida') {
    super(400, message)
  }
}
