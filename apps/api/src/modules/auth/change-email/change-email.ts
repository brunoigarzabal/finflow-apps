import { verify } from 'argon2'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import {
  BadRequest,
  Conflict,
  Unauthorized,
} from '@/shared/infra/http/errors/index.js'

import { changeEmailBody, changeEmailResponse } from './change-email.schema.js'

export async function changeEmailHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/email',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['Auth'],
        summary: 'Change the current user email',
        security: [{ bearer: [] }],
        body: changeEmailBody,
        response: { 200: changeEmailResponse },
      },
    },
    async (request) => {
      const { email, password } = request.body
      const userId = await request.getCurrentUserId()
      const repo = userRepository(app.prisma)

      const user = await repo.findByIdWithAuth(userId)
      if (!user) {
        throw new Unauthorized('Usuário não encontrado')
      }

      if (!user.passwordHash) {
        throw new BadRequest('Defina uma senha antes de alterar o e-mail')
      }

      const isValid = await verify(user.passwordHash, password)
      if (!isValid) {
        throw new BadRequest('Senha incorreta')
      }

      if (email !== user.email) {
        const existing = await repo.findByEmail(email)
        if (existing) {
          throw new Conflict('E-mail já está em uso')
        }
      }

      await repo.update(userId, { email })

      return { success: true }
    }
  )
}
