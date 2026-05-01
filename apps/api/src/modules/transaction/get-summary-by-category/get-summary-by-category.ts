import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'

import { getRecurringOccurrences } from '../helpers/recurring-occurrences.js'

import {
  summaryByCategoryQuery,
  summaryByCategoryResponse,
} from './get-summary-by-category.schema.js'

export async function getSummaryByCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/summary-by-category',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary grouped by category',
        security: [{ bearer: [] }],
        querystring: summaryByCategoryQuery,
        response: { 200: summaryByCategoryResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.query
      const { startDate, endDate } = resolveDateRange(
        input.startDate,
        input.endDate
      )

      const transactionRepo = transactionRepository(app.prisma)
      const categoryRepo = categoryRepository(app.prisma)

      const where = {
        userId,
        ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
        type: input.type,
        recurringOverride: null,
        date: { gte: startDate, lte: endDate },
        ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
      }

      const [aggregations, recurringOccurrences] = await Promise.all([
        transactionRepo.groupByCategory(where),
        getRecurringOccurrences(app.prisma, userId, startDate, endDate),
      ])

      const categoryTotals = new Map<
        string,
        { totalAmount: number; transactionCount: number }
      >()

      for (const aggregation of aggregations) {
        if (!aggregation.categoryId) {
          continue
        }

        categoryTotals.set(aggregation.categoryId, {
          totalAmount: aggregation._sum.amount ?? 0,
          transactionCount: aggregation._count.id,
        })
      }

      for (const occurrence of recurringOccurrences) {
        if (occurrence.type !== input.type || !occurrence.categoryId) {
          continue
        }
        if (input.isPaid !== undefined && occurrence.isPaid !== input.isPaid) {
          continue
        }
        if (
          input.bankAccountId &&
          occurrence.bankAccountId !== input.bankAccountId
        ) {
          continue
        }

        const current = categoryTotals.get(occurrence.categoryId) ?? {
          totalAmount: 0,
          transactionCount: 0,
        }

        categoryTotals.set(occurrence.categoryId, {
          totalAmount: current.totalAmount + occurrence.amount,
          transactionCount: current.transactionCount + 1,
        })
      }

      if (categoryTotals.size === 0) {
        return { summaryByCategory: [], total: 0 }
      }

      const categoryIds = Array.from(categoryTotals.keys())
      const categories = await categoryRepo.findManyByIds(categoryIds)
      const categoryMap = new Map(categories.map((c) => [c.id, c]))

      const total = Array.from(categoryTotals.values()).reduce(
        (sum, entry) => sum + entry.totalAmount,
        0
      )

      const summaryByCategory = Array.from(categoryTotals.entries())
        .map(([categoryId, entry]) => {
          const category = categoryMap.get(categoryId)
          const totalAmount = entry.totalAmount
          return {
            categoryId,
            categoryName: category?.name ?? '',
            categoryColor: category?.color ?? '',
            categoryIcon: category?.icon ?? '',
            totalAmount,
            transactionCount: entry.transactionCount,
            percentageOfTotal:
              total > 0 ? Math.round((totalAmount / total) * 1000) / 10 : 0,
          }
        })
        .sort((a, b) => b.totalAmount - a.totalAmount)

      return { summaryByCategory, total }
    }
  )
}
