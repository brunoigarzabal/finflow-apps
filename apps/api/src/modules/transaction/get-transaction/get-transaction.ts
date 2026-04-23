import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'
import { transactionDetailResponse, transactionIdParam } from './get-transaction.schema.js'

export async function getTransactionHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get a transaction by ID',
        security: [{ bearer: [] }],
        params: transactionIdParam,
        response: { 200: transactionDetailResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = transactionRepository(app.prisma)

      const transaction = await repo.findById(request.params.id)
      if (!transaction || transaction.userId !== userId) {
        throw new NotFound('Transação não encontrada')
      }

      let relatedTransaction = null
      if (transaction.type === 'TRANSFER' && transaction.transferId) {
        relatedTransaction = await repo.findRelated(
          transaction.transferId,
          transaction.id,
        )
      }

      return { ...transaction, relatedTransaction }
    },
  )
}
