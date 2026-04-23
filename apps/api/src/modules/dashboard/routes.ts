import type { FastifyInstance } from 'fastify'

import { getDashboardHandler } from './get-dashboard/get-dashboard.js'

export async function dashboardRoutes(app: FastifyInstance) {
  app.register(getDashboardHandler)
}
