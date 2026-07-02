import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'

import { bankAccountIdParam } from '../schemas.js'

export async function archiveBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Archive a bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = bankAccountRepository(app.prisma)
      const account = await repo.findById(request.params.id)

      if (!account || account.userId !== userId) {
        throw new NotFound('Conta bancária não encontrada')
      }

      if (account.isDefault) {
        throw new BadRequest('Defina outra conta padrão antes de arquivar')
      }

      const { count } = await repo.archiveMany(request.params.id, userId)

      if (count === 0) {
        throw new NotFound('Conta bancária não encontrada')
      }

      return reply.status(204).send()
    }
  )
}
