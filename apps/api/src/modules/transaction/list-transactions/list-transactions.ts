import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { Prisma } from '../../../../generated/prisma/client.js'

import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'
import { getRecurringOccurrences } from '../helpers/recurring-occurrences.js'
import {
  listTransactionsQuery,
  transactionListResponse,
} from './list-transactions.schema.js'

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

      const { startDate, endDate } = resolveDateRange(
        input.startDate,
        input.endDate
      )

      const baseWhere: Prisma.TransactionWhereInput = {
        userId,
        date: { gte: startDate, lte: endDate },
        recurringOverride: null,
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

      const [transactions, recurringOccurrences] = await Promise.all([
        repo.findMany(where),
        getRecurringOccurrences(app.prisma, userId, startDate, endDate),
      ])

      const transferIds = transactions
        .filter((t) => t.type === 'TRANSFER' && t.transferId)
        .map((t) => t.transferId as string)

      const relatedRecords = transferIds.length
        ? await repo.findRelatedMany(transferIds)
        : []

      const enrichedTransactions = transactions.map((t) => {
        const installmentCount = t.installmentGroup?.count ?? null
        if (t.type !== 'TRANSFER' || !t.transferId) {
          return { ...t, installmentCount, relatedBankAccount: null }
        }
        const pair = relatedRecords.find(
          (r) => r.transferId === t.transferId && r.id !== t.id
        )
        return {
          ...t,
          installmentCount,
          relatedBankAccount: pair?.bankAccount ?? null,
        }
      })

      const filteredOccurrences = recurringOccurrences.filter((occurrence) => {
        if (input.type && occurrence.type !== input.type) {
          return false
        }
        if (input.categoryId && occurrence.categoryId !== input.categoryId) {
          return false
        }
        if (
          input.bankAccountId &&
          occurrence.bankAccountId !== input.bankAccountId
        ) {
          return false
        }
        if (input.isPaid !== undefined && occurrence.isPaid !== input.isPaid) {
          return false
        }
        return true
      })

      const recurringListItems = filteredOccurrences.map((occurrence) => ({
        ...occurrence,
        relatedBankAccount: null,
      }))

      const transactionsWithRecurring = [
        ...enrichedTransactions,
        ...recurringListItems,
      ].sort((a, b) => {
        const dateDiff = b.date.getTime() - a.date.getTime()
        if (dateDiff !== 0) {
          return dateDiff
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
      })

      return { transactions: transactionsWithRecurring }
    }
  )
}
