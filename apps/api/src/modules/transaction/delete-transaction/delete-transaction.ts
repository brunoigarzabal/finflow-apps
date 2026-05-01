import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import { recalculateBalance } from '../helpers/recalculate-balance.js'

import {
  deleteTransactionBody,
  transactionIdParam,
} from './delete-transaction.schema.js'

export async function deleteTransactionHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Delete a transaction',
        security: [{ bearer: [] }],
        params: transactionIdParam,
        body: deleteTransactionBody,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const input = request.body

      await app.prisma.$transaction(async (tx) => {
        const repo = transactionRepository(tx)
        const existing = await repo.findByIdRaw(request.params.id)

        if (!existing || existing.userId !== userId) {
          throw new NotFound('Transação não encontrada')
        }

        const affectedAccountIds = new Set([existing.bankAccountId])

        if (input.scope === 'ALL_REMAINING' && existing.installmentGroupId) {
          const remainingTransactions = await repo.findMany({
            userId,
            installmentGroupId: existing.installmentGroupId,
            date: { gte: existing.date },
          })

          for (const transaction of remainingTransactions) {
            affectedAccountIds.add(transaction.bankAccountId)
          }

          await repo.deleteMany({
            userId,
            installmentGroupId: existing.installmentGroupId,
            date: { gte: existing.date },
          })

          for (const accountId of affectedAccountIds) {
            await recalculateBalance(tx, accountId)
          }

          return
        }

        if (existing.type === 'TRANSFER' && existing.transferId) {
          const paired = await repo.findRelated(
            existing.transferId,
            request.params.id
          )

          if (paired) {
            affectedAccountIds.add(paired.bankAccountId)
          }

          await repo.deleteMany({ transferId: existing.transferId })
        } else {
          await repo.delete(request.params.id)
        }

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }
      })

      return reply.status(204).send()
    }
  )
}
