import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { categoryRepository } from '@/shared/database/repositories/category.repository.js'
import { Conflict } from '@/shared/infra/http/errors/index.js'

import {
  createCategoryBody,
  categoryResponse,
} from './create-category.schema.js'

export async function createCategoryHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Create a category',
        security: [{ bearer: [] }],
        body: createCategoryBody,
        response: { 201: categoryResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const repo = categoryRepository(app.prisma)

      try {
        const category = await repo.create({
          name: request.body.name,
          type: request.body.type,
          color: request.body.color,
          icon: request.body.icon,
          isDefault: false,
          userId,
        })
        return reply.status(201).send(category)
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
