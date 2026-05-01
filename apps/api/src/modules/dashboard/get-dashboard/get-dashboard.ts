import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { getSummary } from '@/modules/transaction/get-summary/get-summary.js'
import { formatDateLocal, resolveDateRange } from '@/shared/helpers/date.js'

import { dashboardQuery, dashboardResponse } from './get-dashboard.schema.js'

export async function getDashboardHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get dashboard data',
        security: [{ bearer: [] }],
        querystring: dashboardQuery,
        response: { 200: dashboardResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const { bankAccountId } = request.query

      const { startDate, endDate } = resolveDateRange()

      const accountWhere = {
        userId,
        archived: false,
        ...(bankAccountId ? { id: bankAccountId } : {}),
      }

      const transactionWhere = {
        userId,
        ...(bankAccountId ? { bankAccountId } : {}),
      }

      const [bankAccounts, summaryResult, recentTransactions] =
        await Promise.all([
          app.prisma.bankAccount.findMany({
            where: accountWhere,
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
              currentBalance: true,
            },
            orderBy: { name: 'asc' },
          }),

          getSummary(app.prisma, userId, {
            startDate: formatDateLocal(startDate),
            endDate: formatDateLocal(endDate),
            bankAccountId,
          }),

          app.prisma.transaction.findMany({
            where: transactionWhere,
            select: {
              id: true,
              type: true,
              amount: true,
              description: true,
              date: true,
              isPaid: true,
              bankAccount: {
                select: { id: true, name: true, color: true, icon: true },
              },
              category: {
                select: { id: true, name: true, color: true, icon: true },
              },
            },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            take: 5,
          }),
        ])

      const totalBalance = bankAccounts.reduce(
        (sum, a) => sum + a.currentBalance,
        0
      )

      return {
        bankAccounts,
        totalBalance,
        summary: summaryResult.summary,
        recentTransactions,
      }
    }
  )
}
