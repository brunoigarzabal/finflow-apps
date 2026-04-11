import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { dashboardQuery, dashboardResponse } from './dashboard.schemas.js'
import { getDashboard } from './dashboard.service.js'

export async function dashboardRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
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
      return getDashboard(app.prisma, userId, request.query)
    },
  )
}
