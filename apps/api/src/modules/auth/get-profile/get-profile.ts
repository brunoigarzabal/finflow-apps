import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import { Unauthorized } from '@/shared/infra/http/errors/index.js'

import { profileResponse } from './get-profile.schema.js'

export async function getProfileHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/profile',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get authenticated user profile',
        security: [{ bearer: [] }],
        response: { 200: profileResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = userRepository(app.prisma)
      const user = await repo.findByIdWithAuth(userId)

      if (!user) {
        throw new Unauthorized('Usuário não encontrado')
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          hasPassword: Boolean(user.passwordHash),
          googleLinked: user.accounts.some(
            (account) => account.provider === 'GOOGLE'
          ),
        },
      }
    }
  )
}
