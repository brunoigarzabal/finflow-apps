import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'
import { bankAccountIdParam, bankAccountResponse } from '../schemas.js'

export async function restoreBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id/restore',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Restore an archived bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = bankAccountRepository(app.prisma)
      const account = await repo.findById(request.params.id)

      if (!account || account.userId !== userId) {
        throw new NotFound('Conta bancária não encontrada')
      }

      if (!account.archived) {
        throw new BadRequest('Conta bancária já está ativa')
      }

      return repo.update(request.params.id, { archived: false })
    },
  )
}
