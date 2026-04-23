import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { resolveDateRange } from '@/shared/helpers/date.js'
import { summaryByCategoryQuery, summaryByCategoryResponse } from './get-summary-by-category.schema.js'

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
      const { startDate, endDate } = resolveDateRange(input.startDate, input.endDate)

      const transactionRepo = transactionRepository(app.prisma)
      const categoryRepo = categoryRepository(app.prisma)

      const where = {
        userId,
        isPaid: true,
        type: input.type,
        date: { gte: startDate, lte: endDate },
        ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
      }

      const aggregations = await transactionRepo.groupByCategory(where)

      const categorizedAggregations = aggregations.filter(
        (a): a is typeof a & { categoryId: string } => a.categoryId !== null,
      )

      if (categorizedAggregations.length === 0) {
        return { summaryByCategory: [], total: 0 }
      }

      const categoryIds = categorizedAggregations.map((a) => a.categoryId)
      const categories = await categoryRepo.findManyByIds(categoryIds)
      const categoryMap = new Map(categories.map((c) => [c.id, c]))

      const total = categorizedAggregations.reduce(
        (sum, a) => sum + (a._sum.amount ?? 0),
        0,
      )

      const summaryByCategory = categorizedAggregations.map((agg) => {
        const category = categoryMap.get(agg.categoryId)
        const totalAmount = agg._sum.amount ?? 0
        return {
          categoryId: agg.categoryId,
          categoryName: category?.name ?? '',
          categoryColor: category?.color ?? '',
          categoryIcon: category?.icon ?? '',
          totalAmount,
          transactionCount: agg._count.id,
          percentageOfTotal:
            total > 0 ? Math.round((totalAmount / total) * 1000) / 10 : 0,
        }
      })

      return { summaryByCategory, total }
    },
  )
}
