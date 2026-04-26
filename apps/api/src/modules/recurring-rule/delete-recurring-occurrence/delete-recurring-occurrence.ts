import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { addDays } from '@/shared/helpers/date.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'
import { recalculateBalance } from '@/modules/transaction/helpers/recalculate-balance.js'
import { deleteOccurrenceBody, recurringRuleIdParam } from '../schemas.js'

export async function deleteRecurringOccurrenceHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id/occurrence',
    {
      schema: {
        tags: ['Recurring Rules'],
        summary: 'Cancel recurring occurrence',
        security: [{ bearer: [] }],
        params: recurringRuleIdParam,
        body: deleteOccurrenceBody,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const { occurrenceDate: occurrenceDateInput, scope } = request.body
      const occurrenceDate = new Date(occurrenceDateInput)

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
          occurrenceDate: { gte: occurrenceDate },
        })

        const affectedAccountIds = new Set<string>()
        for (const override of futureOverrides) {
          if (override.transaction) {
            affectedAccountIds.add(override.transaction.bankAccountId)
          }
        }

        if (scope === 'THIS') {
          const currentOverride = futureOverrides.find(
            (override) => override.occurrenceDate.getTime() === occurrenceDate.getTime(),
          )

          if (currentOverride?.transactionId) {
            await transactionRepo.delete(currentOverride.transactionId)
          }

          await recurringOverrideRepo.upsert(rule.id, occurrenceDate, {
            isCancelled: true,
            transactionId: null,
          })
        } else {
          await recurringRuleRepo.update(rule.id, {
            endDate: addDays(occurrenceDate, -1),
          })

          const transactionIds = futureOverrides
            .map((override) => override.transactionId)
            .filter((id): id is string => Boolean(id))

          if (transactionIds.length > 0) {
            await transactionRepo.deleteMany({ id: { in: transactionIds } })
          }
          await recurringOverrideRepo.deleteMany({
            recurringRuleId: rule.id,
            occurrenceDate: { gte: occurrenceDate },
          })
        }

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }
      })

      return reply.status(204).send()
    },
  )
}
