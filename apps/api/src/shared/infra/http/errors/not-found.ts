import { HttpError } from './http-error.js'

export class NotFound extends HttpError {
  constructor(message = 'Não encontrado') {
    super(404, message)
  }
}
