import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function checkHealthHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: z.object({
            status: z.string(),
          }),
        },
      },
    },
    async () => ({ status: 'ok' })
  )
}
