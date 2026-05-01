import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'

import { listRecurringRulesResponse } from '../schemas.js'

export async function listRecurringRulesHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Recurring Rules'],
        summary: 'List recurring rules',
        security: [{ bearer: [] }],
        response: { 200: listRecurringRulesResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const repo = recurringRuleRepository(app.prisma)

      const recurringRules = await repo.findMany({
        userId,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      })

      return { recurringRules }
    }
  )
}
