import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { PrismaClient } from '../../../../generated/prisma/client.js'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'
import { splitIncomeExpense, computeNet } from '../helpers/recalculate-balance.js'
import { summaryQuery, summaryResponse } from './get-summary.schema.js'

interface SummaryInput {
  startDate?: string
  endDate?: string
  bankAccountId?: string
}

export async function getSummary(
  prisma: PrismaClient,
  userId: string,
  input: SummaryInput,
) {
  const { startDate, endDate } = resolveDateRange(input.startDate, input.endDate)

  const dateFilter = { gte: startDate, lte: endDate }
  const accountFilter = input.bankAccountId
    ? { bankAccountId: input.bankAccountId }
    : {}

  const bankAccountRepo = bankAccountRepository(prisma)
  const transactionRepo = transactionRepository(prisma)

  const [accountsAgg, priorAggs, paidAggs, pendingAggs] = await Promise.all([
    bankAccountRepo.aggregate({
      userId,
      archived: false,
      ...(input.bankAccountId ? { id: input.bankAccountId } : {}),
    }),
    transactionRepo.groupBy({
      userId,
      isPaid: true,
      date: { lt: startDate },
      ...accountFilter,
    }),
    transactionRepo.groupBy({
      userId,
      isPaid: true,
      date: dateFilter,
      ...accountFilter,
    }),
    transactionRepo.groupBy({
      userId,
      isPaid: false,
      date: dateFilter,
      ...accountFilter,
    }),
  ])

  const { income: totalIncome, expense: totalExpense } = splitIncomeExpense(paidAggs)
  const { income: pendingIncome, expense: pendingExpense } = splitIncomeExpense(pendingAggs)

  const initialBalance = accountsAgg._sum.initialBalance ?? 0
  const previousBalance = initialBalance + computeNet(priorAggs)

  return {
    summary: {
      previousBalance,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingIncome,
      pendingExpense,
      pendingBalance: pendingIncome - pendingExpense,
    },
  }
}

export async function getSummaryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/summary',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary',
        security: [{ bearer: [] }],
        querystring: summaryQuery,
        response: { 200: summaryResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      return getSummary(app.prisma, userId, request.query)
    },
  )
}
