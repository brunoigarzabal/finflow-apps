import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'
import { updateBankAccountBody, bankAccountIdParam, bankAccountResponse } from './update-bank-account.schema.js'

export async function updateBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Update a bank account',
        security: [{ bearer: [] }],
        params: bankAccountIdParam,
        body: updateBankAccountBody,
        response: { 200: bankAccountResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = bankAccountRepository(app.prisma)

      const existing = await repo.findById(request.params.id)
      if (!existing || existing.userId !== userId) {
        throw new NotFound('Conta bancária não encontrada')
      }

      const { initialBalance, ...rest } = request.body

      const balanceUpdate =
        initialBalance !== undefined
          ? {
              initialBalance,
              currentBalance:
                initialBalance + (existing.currentBalance - existing.initialBalance),
            }
          : {}

      return repo.update(request.params.id, { ...rest, ...balanceUpdate })
    },
  )
}
