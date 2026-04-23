import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { TransactionType } from '../../../../generated/prisma/enums.js'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { transactionRepository, bankAccountSqlFilter } from '@/shared/database/repositories/transaction.repository.js'
import { formatDateLocal, resolveDateRange } from '@/shared/helpers/date.js'
import { computeNet } from '../helpers/recalculate-balance.js'
import { balanceOverTimeQuery, balanceOverTimeResponse } from './get-balance-over-time.schema.js'
import { Prisma } from '../../../../generated/prisma/client.js'

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

      const bankAccountRepo = bankAccountRepository(app.prisma)
      const transactionRepo = transactionRepository(app.prisma)

      const accountWhere = {
        userId,
        archived: false,
        ...(input.bankAccountId ? { id: input.bankAccountId } : {}),
      }

      const transactionWhere = {
        userId,
        isPaid: true,
        ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
      }

      const [accountAgg, priorAgg, dailyRows] = await Promise.all([
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
            AND is_paid = true
            AND date >= ${startDate}
            AND date <= ${endDate}
            ${bankAccountSqlFilter(input.bankAccountId)}
          GROUP BY date, type, is_transfer_out
        `,
      ])

      const initialBalanceSum = accountAgg._sum.initialBalance ?? 0
      const openingBalance = initialBalanceSum + computeNet(priorAgg)

      const dailyNetMap = new Map<string, number>()
      for (const row of dailyRows) {
        const dateStr = row.date
        const current = dailyNetMap.get(dateStr) ?? 0
        const amount = Number(row.total)
        if (row.type === 'INCOME') {
          dailyNetMap.set(dateStr, current + amount)
        } else if (row.type === 'EXPENSE') {
          dailyNetMap.set(dateStr, current - amount)
        } else if (row.type === 'TRANSFER') {
          dailyNetMap.set(
            dateStr,
            current + (row.is_transfer_out ? -amount : amount),
          )
        }
      }

      const balanceOverTime: { date: string; balance: number }[] = []
      let runningBalance = openingBalance
      const current = new Date(startDate)

      while (current <= endDate) {
        const dateStr = formatDateLocal(current)
        runningBalance += dailyNetMap.get(dateStr) ?? 0
        balanceOverTime.push({ date: dateStr, balance: runningBalance })
        current.setDate(current.getDate() + 1)
      }

      return { balanceOverTime }
    },
  )
}
