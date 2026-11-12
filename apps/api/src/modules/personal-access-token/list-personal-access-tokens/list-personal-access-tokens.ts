import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { personalAccessTokenRepository } from '@/shared/database/repositories/personal-access-token.repository.js'

import { personalAccessTokenListResponse } from './list-personal-access-tokens.schema.js'

export async function listPersonalAccessTokensHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Personal Access Tokens'],
        summary: 'List active personal access tokens',
        security: [{ bearer: [] }],
        response: { 200: personalAccessTokenListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = personalAccessTokenRepository(app.prisma)
      const personalAccessTokens = await repo.findActiveByUser(userId)
      return { personalAccessTokens }
    }
  )
}
