import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'
import { categoryIdParam, categoryResponse } from '../schemas.js'

export async function restoreCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id/restore',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Restore an archived category',
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

      if (!category.archived) {
        throw new BadRequest('Categoria já está ativa')
      }

      return repo.update(request.params.id, { archived: false })
    },
  )
}
