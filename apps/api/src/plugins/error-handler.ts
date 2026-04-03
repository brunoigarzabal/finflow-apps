import type { FastifyInstance, FastifyError } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'

import { HttpError } from '../errors/index.js'

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.setErrorHandler((error: FastifyError | HttpError | ZodError, _request, reply) => {
      if (error instanceof HttpError) {
        return reply
          .status(error.statusCode)
          .send({ message: error.message })
      }

      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error', errors: error.issues })
      }

      if ('statusCode' in error && error.statusCode) {
        return reply
          .status(error.statusCode)
          .send({ message: error.message })
      }

      fastify.log.error(error)

      return reply
        .status(500)
        .send({ message: 'Internal server error' })
    })
  },
  { name: 'error-handler' },
)
