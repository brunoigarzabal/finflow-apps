import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createCategoryBody,
  updateCategoryBody,
  listCategoriesQuery,
  categoryIdParam,
  categoryResponse,
  categoryListResponse,
} from './category.schemas.js'
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
} from './category.service.js'

export async function categoryRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
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
      const categories = await listCategories(
        app.prisma,
        userId,
        request.query.type,
        request.query.archived,
      )
      return { categories }
    },
  )

  typedApp.get(
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
      return getCategory(app.prisma, userId, request.params.id)
    },
  )

  typedApp.post(
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
      const category = await createCategory(app.prisma, userId, request.body)
      return reply.status(201).send(category)
    },
  )

  typedApp.patch(
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
      return updateCategory(
        app.prisma,
        userId,
        request.params.id,
        request.body,
      )
    },
  )

  typedApp.delete(
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
      await archiveCategory(app.prisma, userId, request.params.id)
      return reply.status(204).send()
    },
  )

  typedApp.patch(
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
      return restoreCategory(app.prisma, userId, request.params.id)
    },
  )
}
