import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'

import { bankAccountIdParam, bankAccountResponse } from '../schemas.js'

export async function setDefaultBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id/default',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Set a bank account as default',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const { id } = request.params
      const repo = bankAccountRepository(app.prisma)
      const account = await repo.findById(id)

      if (!account || account.userId !== userId) {
        throw new NotFound('Conta bancária não encontrada')
      }

      if (account.archived) {
        throw new BadRequest(
          'Não é possível definir uma conta arquivada como padrão'
        )
      }

      return app.prisma.$transaction(async (tx) => {
        const txRepo = bankAccountRepository(tx)
        await txRepo.clearDefault(userId)
        return txRepo.update(id, { isDefault: true })
      })
    }
  )
}
