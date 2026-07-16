import { hash, verify } from 'argon2'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { userRepository } from '@/shared/database/repositories/user.repository.js'
import { BadRequest, Unauthorized } from '@/shared/infra/http/errors/index.js'

import {
  changePasswordBody,
  changePasswordResponse,
} from './change-password.schema.js'

export async function changePasswordHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/password',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['Auth'],
        summary: 'Change or set the current user password',
        security: [{ bearer: [] }],
        body: changePasswordBody,
        response: { 200: changePasswordResponse },
      },
    },
    async (request) => {
      const { currentPassword, newPassword } = request.body
      const userId = await request.getCurrentUserId()
      const repo = userRepository(app.prisma)

      const user = await repo.findByIdWithAuth(userId)
      if (!user) {
        throw new Unauthorized('Usuário não encontrado')
      }

      if (user.passwordHash) {
        if (!currentPassword) {
          throw new BadRequest('Senha atual é obrigatória')
        }

        const isValid = await verify(user.passwordHash, currentPassword)
        if (!isValid) {
          throw new BadRequest('Senha atual incorreta')
        }
      }

      const passwordHash = await hash(newPassword)
      await repo.update(userId, { passwordHash })

      return { success: true }
    }
  )
}
