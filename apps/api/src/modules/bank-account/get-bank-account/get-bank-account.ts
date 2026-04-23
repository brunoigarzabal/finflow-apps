import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'
import { bankAccountIdParam, bankAccountResponse } from './get-bank-account.schema.js'

export async function getBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Get a bank account by ID',
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

      return account
    },
  )
}
