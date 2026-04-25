import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { Prisma } from '../../../../generated/prisma/client.js'

import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'
import { listTransactionsQuery, transactionListResponse } from './list-transactions.schema.js'

export async function listTransactionsHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearer: [] }],
        querystring: listTransactionsQuery,
        response: { 200: transactionListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.query
      const repo = transactionRepository(app.prisma)

      const { startDate, endDate } = resolveDateRange(input.startDate, input.endDate)

      const baseWhere = {
        userId,
        date: { gte: startDate, lte: endDate },
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
      }

      const where: Prisma.TransactionWhereInput = input.bankAccountId
        ? { ...baseWhere, bankAccountId: input.bankAccountId }
        : {
            ...baseWhere,
            OR: [{ type: { not: 'TRANSFER' } }, { isTransferOut: true }],
          }

      const transactions = await repo.findMany(where)

      const transferIds = transactions
        .filter((t) => t.type === 'TRANSFER' && t.transferId)
        .map((t) => t.transferId as string)

      const relatedRecords = transferIds.length
        ? await repo.findRelatedMany(transferIds)
        : []

      const enrichedTransactions = transactions.map((t) => {
        if (t.type !== 'TRANSFER' || !t.transferId) {
          return { ...t, relatedBankAccount: null }
        }
        const pair = relatedRecords.find(
          (r) => r.transferId === t.transferId && r.id !== t.id,
        )
        return {
          ...t,
          relatedBankAccount: pair?.bankAccount ?? null,
        }
      })

      return {
        transactions: enrichedTransactions,
      }
    },
  )
}
