import type { FastifyInstance } from 'fastify'

import { checkHealthHandler } from './check-health/check-health.js'

export async function healthRoutes(app: FastifyInstance) {
  app.register(checkHealthHandler)
}
