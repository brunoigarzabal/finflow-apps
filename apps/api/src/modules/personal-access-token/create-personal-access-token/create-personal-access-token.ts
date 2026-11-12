import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { personalAccessTokenRepository } from '@/shared/database/repositories/personal-access-token.repository.js'
import { BadRequest } from '@/shared/infra/http/errors/index.js'

import { generatePersonalAccessToken } from '../helpers/token.js'

import {
  createPersonalAccessTokenBody,
  createPersonalAccessTokenResponse,
} from './create-personal-access-token.schema.js'

const MAX_ACTIVE_TOKENS = 10

export async function createPersonalAccessTokenHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Personal Access Tokens'],
        summary: 'Create a personal access token (shown only once)',
        security: [{ bearer: [] }],
        body: createPersonalAccessTokenBody,
        response: { 201: createPersonalAccessTokenResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = personalAccessTokenRepository(app.prisma)

      const activeTokens = await repo.findActiveByUser(userId)
      if (activeTokens.length >= MAX_ACTIVE_TOKENS) {
        throw new BadRequest(
          `Limite de ${MAX_ACTIVE_TOKENS} tokens ativos atingido. Revogue um token antes de criar outro`
        )
      }

      const { token, tokenHash, tokenPrefix } = generatePersonalAccessToken()
      const personalAccessToken = await repo.create({
        name: request.body.name,
        tokenHash,
        tokenPrefix,
        userId,
      })

      return reply.status(201).send({ personalAccessToken, token })
    }
  )
}
