import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Prisma } from '../../../../generated/prisma/client.js'
import type { TransactionType } from '../../../../generated/prisma/enums.js'

import { bankAccountSqlFilter } from '@/shared/database/repositories/transaction.repository.js'
import { summaryByPeriodQuery, summaryByPeriodResponse } from './get-summary-by-period.schema.js'

export async function getSummaryByPeriodHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/summary-by-period',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary grouped by month',
        security: [{ bearer: [] }],
        querystring: summaryByPeriodQuery,
        response: { 200: summaryByPeriodResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.query

      const now = new Date()
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - input.months + 1,
        1,
      )
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const rows = await app.prisma.$queryRaw<
        { month: string; type: TransactionType; total: number }[]
      >`
        SELECT
          TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
          type,
          SUM(amount)::int AS total
        FROM transactions
        WHERE user_id = ${userId}
          AND is_paid = true
          AND type IN ('INCOME', 'EXPENSE')
          AND date >= ${startDate}
          AND date <= ${endDate}
          ${bankAccountSqlFilter(input.bankAccountId)}
        GROUP BY DATE_TRUNC('month', date), type
      `

      const dataMap = new Map<
        string,
        { totalIncome: number; totalExpense: number }
      >()
      for (const row of rows) {
        const entry = dataMap.get(row.month) ?? { totalIncome: 0, totalExpense: 0 }
        if (row.type === 'INCOME') {
          entry.totalIncome += Number(row.total)
        } else if (row.type === 'EXPENSE') {
          entry.totalExpense += Number(row.total)
        }
        dataMap.set(row.month, entry)
      }

      const summaryByPeriod: {
        month: string
        totalIncome: number
        totalExpense: number
        balance: number
      }[] = []

      for (let i = 0; i < input.months; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const entry = dataMap.get(month) ?? { totalIncome: 0, totalExpense: 0 }
        summaryByPeriod.push({
          month,
          totalIncome: entry.totalIncome,
          totalExpense: entry.totalExpense,
          balance: entry.totalIncome - entry.totalExpense,
        })
      }

      return { summaryByPeriod }
    },
  )
}
