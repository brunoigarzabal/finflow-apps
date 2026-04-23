import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'
import { categoryIdParam, categoryResponse } from './get-category.schema.js'

export async function getCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get a category by ID',
        security: [{ bearer: [] }],
        params: categoryIdParam,
        response: { 200: categoryResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = categoryRepository(app.prisma)
      const category = await repo.findById(request.params.id)

      if (!category || category.userId !== userId) {
        throw new NotFound('Categoria não encontrada')
      }

      return category
    },
  )
}
