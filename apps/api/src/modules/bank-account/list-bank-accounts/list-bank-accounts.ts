import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { listBankAccountsQuery, bankAccountListResponse } from './list-bank-accounts.schema.js'

export async function listBankAccountsHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'List bank accounts',
        security: [{ bearer: [] }],
        querystring: listBankAccountsQuery,
        response: { 200: bankAccountListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = bankAccountRepository(app.prisma)
      const bankAccounts = await repo.findMany(userId, request.query.archived)
      return { bankAccounts }
    },
  )
}
