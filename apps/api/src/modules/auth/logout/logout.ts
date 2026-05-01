import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { AUTH_COOKIE_CLEAR_OPTIONS } from '../helpers/cookie-options'

export async function logoutHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Clear authentication cookie',
      },
    },
    async (_request, reply) => {
      reply.clearCookie('token', AUTH_COOKIE_CLEAR_OPTIONS)
      return reply.send({ success: true })
    }
  )
}
