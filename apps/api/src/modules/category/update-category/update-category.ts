import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { Conflict, NotFound } from '@/shared/infra/http/errors/index.js'

import {
  updateCategoryBody,
  categoryIdParam,
  categoryResponse,
} from './update-category.schema.js'

export async function updateCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Update a category',
        security: [{ bearer: [] }],
        params: categoryIdParam,
        body: updateCategoryBody,
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

      try {
        return await repo.update(request.params.id, request.body)
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error as { code: string }).code === 'P2002'
        ) {
          throw new Conflict('Categoria com mesmo nome e tipo já existe')
        }
        throw error
      }
    }
  )
}
