import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '@/shared/infra/http/errors/index.js'

import { unlinkGoogleResponse } from './unlink-google.schema.js'

export async function unlinkGoogleHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/accounts/google',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['Auth'],
        summary: 'Unlink the Google account from the current user',
        security: [{ bearer: [] }],
        response: { 200: unlinkGoogleResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = userRepository(app.prisma)

      const user = await repo.findByIdWithAuth(userId)
      if (!user) {
        throw new Unauthorized('Usuário não encontrado')
      }

      const hasGoogle = user.accounts.some(
        (account) => account.provider === 'GOOGLE'
      )
      if (!hasGoogle) {
        throw new NotFound('Conta Google não vinculada')
      }

      if (!user.passwordHash) {
        throw new BadRequest('Defina uma senha antes de desvincular o Google')
      }

      await repo.deleteAccountByProvider('GOOGLE', userId)

      return { success: true }
    }
  )
}
