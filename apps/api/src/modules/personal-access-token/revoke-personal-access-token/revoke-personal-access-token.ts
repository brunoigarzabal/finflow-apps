import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { personalAccessTokenRepository } from '@/shared/database/repositories/personal-access-token.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import { personalAccessTokenIdParam } from '../schemas.js'

export async function revokePersonalAccessTokenHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['Personal Access Tokens'],
        summary: 'Revoke a personal access token',
        security: [{ bearer: [] }],
        params: personalAccessTokenIdParam,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = personalAccessTokenRepository(app.prisma)
      const { count } = await repo.revoke(request.params.id, userId)

      if (count === 0) {
        throw new NotFound('Token de acesso pessoal não encontrado')
      }

      return reply.status(204).send()
    }
  )
}
