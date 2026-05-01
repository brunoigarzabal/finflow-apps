import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

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
      reply.clearCookie('token', { path: '/' })
      return reply.send({ success: true })
    }
  )
}
