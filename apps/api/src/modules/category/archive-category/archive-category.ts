import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import { categoryIdParam } from '../schemas.js'

export async function archiveCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Archive a category',
        security: [{ bearer: [] }],
        params: categoryIdParam,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = categoryRepository(app.prisma)
      const { count } = await repo.archiveMany(request.params.id, userId)

      if (count === 0) {
        throw new NotFound('Categoria não encontrada')
      }

      return reply.status(204).send()
    }
  )
}
