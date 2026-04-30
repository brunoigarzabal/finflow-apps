import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { TransactionType } from '../../../../generated/prisma/enums.js'

import { Prisma } from '../../../../generated/prisma/client.js'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { transactionRepository, bankAccountSqlFilter } from '@/shared/database/repositories/transaction.repository.js'
import { addDays, formatDateLocal, resolveDateRange } from '@/shared/helpers/date.js'
import { computeNet } from '../helpers/recalculate-balance.js'
import {
  getRecurringOccurrences,
  type RecurringOccurrence,
} from '../helpers/recurring-occurrences.js'
import { balanceOverTimeQuery, balanceOverTimeResponse } from './get-balance-over-time.schema.js'

function classifyOccurrence(
  occurrence: RecurringOccurrence,
  cur: { income: number; expense: number },
) {
  if (occurrence.type === 'INCOME') {
    cur.income += occurrence.amount
  } else if (occurrence.type === 'EXPENSE') {
    cur.expense += occurrence.amount
  } else if (occurrence.type === 'TRANSFER') {
    if (occurrence.isTransferOut) {
      cur.expense += occurrence.amount
    } else {
      cur.income += occurrence.amount
    }
  }
}

export async function getBalanceOverTimeHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/balance-over-time',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get daily balance evolution over a period',
        security: [{ bearer: [] }],
        querystring: balanceOverTimeQuery,
        response: { 200: balanceOverTimeResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.query
      const { startDate, endDate } = resolveDateRange(input.startDate, input.endDate)
      const includeUnpaid = input.includeUnpaid ?? false
      const paidOnlySql = includeUnpaid ? Prisma.empty : Prisma.sql`AND is_paid = true`

      const bankAccountRepo = bankAccountRepository(app.prisma)
      const transactionRepo = transactionRepository(app.prisma)

      const accountWhere = {
        userId,
        archived: false,
        ...(input.bankAccountId ? { id: input.bankAccountId } : {}),
      }

      const transactionWhere = {
        userId,
        ...(includeUnpaid ? {} : { isPaid: true }),
        ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
      }

      const [accountAgg, priorAgg, dailyRows, recurringOccurrences, priorRecurringOccurrences] = await Promise.all([
        bankAccountRepo.aggregate(accountWhere),
        transactionRepo.groupBy({
          ...transactionWhere,
          date: { lt: startDate },
        }),
        app.prisma.$queryRaw<
          {
            date: string
            type: TransactionType
            is_transfer_out: boolean | null
            total: number
          }[]
        >`
          SELECT
            date::text AS date,
            type,
            is_transfer_out,
            SUM(amount)::int AS total
          FROM transactions
          WHERE user_id = ${userId}
            ${paidOnlySql}
            AND date >= ${startDate}
            AND date <= ${endDate}
            ${bankAccountSqlFilter(input.bankAccountId)}
          GROUP BY date, type, is_transfer_out
        `,
        getRecurringOccurrences(app.prisma, userId, startDate, endDate),
        getRecurringOccurrences(app.prisma, userId, new Date(0), addDays(startDate, -1)),
      ])

      const filterOccurrences = (occurrences: RecurringOccurrence[]) =>
        occurrences.filter((o) => {
          if (!o.isVirtual) return false
          if (!includeUnpaid && !o.isPaid) return false
          if (input.bankAccountId && o.bankAccountId !== input.bankAccountId) return false
          return true
        })

      const filteredPrior = filterOccurrences(priorRecurringOccurrences)
      const priorAccum = { income: 0, expense: 0 }
      for (const o of filteredPrior) {
        classifyOccurrence(o, priorAccum)
      }
      const priorRecurringNet = priorAccum.income - priorAccum.expense

      const initialBalanceSum = accountAgg._sum.initialBalance ?? 0
      const openingBalance = initialBalanceSum + computeNet(priorAgg) + priorRecurringNet

      const dailyFlow = new Map<string, { income: number; expense: number }>()
      for (const row of dailyRows) {
        const dateStr = row.date
        const amount = Number(row.total)
        const cur = dailyFlow.get(dateStr) ?? { income: 0, expense: 0 }
        if (row.type === 'INCOME') {
          cur.income += amount
        } else if (row.type === 'EXPENSE') {
          cur.expense += amount
        } else if (row.type === 'TRANSFER') {
          if (row.is_transfer_out) {
            cur.expense += amount
          } else {
            cur.income += amount
          }
        }
        dailyFlow.set(dateStr, cur)
      }

      const filteredRecurring = filterOccurrences(recurringOccurrences)
      for (const o of filteredRecurring) {
        const dateStr = o.date.toISOString().slice(0, 10)
        const cur = dailyFlow.get(dateStr) ?? { income: 0, expense: 0 }
        classifyOccurrence(o, cur)
        dailyFlow.set(dateStr, cur)
      }

      const balanceOverTime: {
        date: string
        income: number
        expense: number
        balance: number
      }[] = []
      let runningBalance = openingBalance
      const current = new Date(startDate)

      while (current <= endDate) {
        const dateStr = formatDateLocal(current)
        const split = dailyFlow.get(dateStr) ?? { income: 0, expense: 0 }
        runningBalance += split.income - split.expense
        balanceOverTime.push({
          date: dateStr,
          income: split.income,
          expense: split.expense,
          balance: runningBalance,
        })
        current.setUTCDate(current.getUTCDate() + 1)
      }

      return { balanceOverTime }
    },
  )
}
