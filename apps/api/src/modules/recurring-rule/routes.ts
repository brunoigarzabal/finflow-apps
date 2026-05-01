import type { FastifyInstance } from 'fastify'

import { deleteRecurringOccurrenceHandler } from './delete-recurring-occurrence/delete-recurring-occurrence.js'
import { deleteRecurringRuleHandler } from './delete-recurring-rule/delete-recurring-rule.js'
import { listRecurringRulesHandler } from './list-recurring-rules/list-recurring-rules.js'
import { updateRecurringRuleHandler } from './update-recurring-rule/update-recurring-rule.js'

export async function recurringRuleRoutes(app: FastifyInstance) {
  app.register(listRecurringRulesHandler)
  app.register(updateRecurringRuleHandler)
  app.register(deleteRecurringOccurrenceHandler)
  app.register(deleteRecurringRuleHandler)
}
