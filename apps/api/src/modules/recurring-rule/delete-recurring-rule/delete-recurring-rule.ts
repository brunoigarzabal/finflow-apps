import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { recalculateBalance } from '@/modules/transaction/helpers/recalculate-balance.js'
import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { addDays } from '@/shared/helpers/date.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import { deleteRecurringRuleBody, recurringRuleIdParam } from '../schemas.js'

export async function deleteRecurringRuleHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        tags: ['Recurring Rules'],
        summary: 'End recurring rule',
        security: [{ bearer: [] }],
        params: recurringRuleIdParam,
        body: deleteRecurringRuleBody,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const endDate = new Date(request.body.endDate)

      await app.prisma.$transaction(async (tx) => {
        const recurringRuleRepo = recurringRuleRepository(tx)
        const recurringOverrideRepo = recurringOverrideRepository(tx)
        const transactionRepo = transactionRepository(tx)
        const rule = await recurringRuleRepo.findById(request.params.id)

        if (!rule || rule.userId !== userId) {
          throw new NotFound('Regra de recorrência não encontrada')
        }

        const futureOverrides = await recurringOverrideRepo.findMany({
          recurringRuleId: rule.id,
          occurrenceDate: { gte: endDate },
        })
        const transactionIds = futureOverrides
          .map((override) => override.transactionId)
          .filter((id): id is string => Boolean(id))
        const affectedAccountIds = new Set(
          futureOverrides
            .map((override) => override.transaction?.bankAccountId)
            .filter((id): id is string => Boolean(id))
        )

        await recurringRuleRepo.update(rule.id, {
          endDate: addDays(endDate, -1),
        })

        if (transactionIds.length > 0) {
          await transactionRepo.deleteMany({ id: { in: transactionIds } })
        }

        await recurringOverrideRepo.deleteMany({
          recurringRuleId: rule.id,
          occurrenceDate: { gte: endDate },
        })

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }
      })

      return reply.status(204).send()
    }
  )
}
