import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { listCategoriesQuery, categoryListResponse } from './list-categories.schema.js'

export async function listCategoriesHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'List categories',
        security: [{ bearer: [] }],
        querystring: listCategoriesQuery,
        response: { 200: categoryListResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = categoryRepository(app.prisma)
      const categories = await repo.findMany(userId, {
        type: request.query.type,
        archived: request.query.archived,
      })
      return { categories }
    },
  )
}
