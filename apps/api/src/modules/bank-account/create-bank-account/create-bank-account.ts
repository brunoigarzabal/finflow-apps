import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { createBankAccountBody, bankAccountResponse } from './create-bank-account.schema.js'

export async function createBankAccountHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Bank Accounts'],
        summary: 'Create a bank account',
        security: [{ bearer: [] }],
        body: createBankAccountBody,
        response: { 201: bankAccountResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = bankAccountRepository(app.prisma)
      const account = await repo.create({
        name: request.body.name,
        type: request.body.type,
        color: request.body.color,
        icon: request.body.icon,
        initialBalance: request.body.initialBalance,
        currentBalance: request.body.initialBalance,
        userId,
      })
      return reply.status(201).send(account)
    },
  )
}
