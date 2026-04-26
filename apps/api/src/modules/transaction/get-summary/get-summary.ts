import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { PrismaClient } from '../../../../generated/prisma/client.js'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'
import { getRecurringOccurrences, type RecurringOccurrence } from '../helpers/recurring-occurrences.js'
import { splitIncomeExpense, computeNet } from '../helpers/recalculate-balance.js'
import { summaryQuery, summaryResponse } from './get-summary.schema.js'

interface SummaryInput {
  startDate?: string
  endDate?: string
  bankAccountId?: string
}

function sumRecurringByStatus(
  occurrences: RecurringOccurrence[],
  isPaid: boolean,
) {
  const totals = { income: 0, expense: 0 }
  for (const occurrence of occurrences) {
    if (occurrence.isPaid !== isPaid) continue
    if (occurrence.type === 'INCOME') totals.income += occurrence.amount
    else if (occurrence.type === 'EXPENSE') totals.expense += occurrence.amount
  }
  return totals
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

  const [accountsAgg, priorAggs, paidAggs, pendingAggs, recurringOccurrences] = await Promise.all([
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
      recurringOverride: null,
      date: dateFilter,
      ...accountFilter,
    }),
    transactionRepo.groupBy({
      userId,
      isPaid: false,
      recurringOverride: null,
      date: dateFilter,
      ...accountFilter,
    }),
    getRecurringOccurrences(prisma, userId, startDate, endDate),
  ])

  const recurringForAccount = input.bankAccountId
    ? recurringOccurrences.filter((occurrence) => occurrence.bankAccountId === input.bankAccountId)
    : recurringOccurrences

  const paidRecurring = sumRecurringByStatus(recurringForAccount, true)
  const pendingRecurring = sumRecurringByStatus(recurringForAccount, false)
  const paidTotals = splitIncomeExpense(paidAggs)
  const pendingTotals = splitIncomeExpense(pendingAggs)
  const totalIncome = paidTotals.income + paidRecurring.income
  const totalExpense = paidTotals.expense + paidRecurring.expense
  const pendingIncome = pendingTotals.income + pendingRecurring.income
  const pendingExpense = pendingTotals.expense + pendingRecurring.expense

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
