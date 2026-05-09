import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { materializeRecurringOccurrence } from '@/modules/transaction/helpers/materialize-recurring-occurrence.js'
import { validateBankAccount } from '@/modules/transaction/helpers/validate-bank-account.js'
import { validateCategory } from '@/modules/transaction/helpers/validate-category.js'
import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { addDays } from '@/shared/helpers/date.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import {
  recurringRuleIdParam,
  updateRecurringRuleBody,
  updateRecurringRuleResponse,
} from '../schemas.js'

export async function updateRecurringRuleHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id',
    {
      schema: {
        tags: ['Recurring Rules'],
        summary: 'Update recurring rule',
        security: [{ bearer: [] }],
        params: recurringRuleIdParam,
        body: updateRecurringRuleBody,
        response: { 200: updateRecurringRuleResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.body
      const occurrenceDate = new Date(input.occurrenceDate)
      const updatedDate = input.date ? new Date(input.date) : occurrenceDate

      return app.prisma.$transaction(async (tx) => {
        const recurringRuleRepo = recurringRuleRepository(tx)
        const recurringOverrideRepo = recurringOverrideRepository(tx)
        const rule = await recurringRuleRepo.findById(request.params.id)

        if (!rule || rule.userId !== userId) {
          throw new NotFound('Regra de recorrência não encontrada')
        }

        const bankAccountId = input.bankAccountId ?? rule.bankAccountId
        const categoryId = input.categoryId ?? rule.categoryId

        if (input.bankAccountId) {
          await validateBankAccount(tx, userId, input.bankAccountId)
        }
        if (input.categoryId) {
          await validateCategory(tx, userId, input.categoryId)
        }

        const sharedData = {
          amount: input.amount ?? rule.amount,
          description: input.description ?? rule.description,
          bankAccountId,
          categoryId,
          isPaid: input.isPaid ?? rule.isPaid,
          notes: input.notes !== undefined ? input.notes : rule.notes,
        }

        if (input.scope === 'THIS') {
          const existingOverride = await recurringOverrideRepo.findMany({
            recurringRuleId: rule.id,
            occurrenceDate,
          })
          const currentOverride = existingOverride[0]

          const transaction = await materializeRecurringOccurrence(tx, {
            ruleId: rule.id,
            occurrenceDate,
            transactionData: {
              type: rule.type,
              amount: sharedData.amount,
              description: sharedData.description,
              date: updatedDate,
              isPaid: sharedData.isPaid,
              notes: sharedData.notes,
              userId,
              bankAccountId: sharedData.bankAccountId,
              categoryId: sharedData.categoryId,
            },
            existingTransactionId: currentOverride?.transactionId ?? undefined,
            accountIdsToRecalculate: [
              rule.bankAccountId,
              sharedData.bankAccountId,
            ],
          })

          return { transaction }
        }

        const recurringRule = await recurringRuleRepo.update(rule.id, {
          endDate: addDays(occurrenceDate, -1),
        })

        const newRecurringRule = await recurringRuleRepo.create({
          type: rule.type,
          amount: sharedData.amount,
          description: sharedData.description,
          frequency: rule.frequency,
          startDate: updatedDate,
          endDate: rule.endDate,
          isPaid: sharedData.isPaid,
          notes: sharedData.notes,
          userId,
          bankAccountId: sharedData.bankAccountId,
          categoryId: sharedData.categoryId,
        })

        await recurringOverrideRepo.updateMany(
          {
            recurringRuleId: recurringRule.id,
            occurrenceDate: { gte: occurrenceDate },
          },
          { recurringRuleId: newRecurringRule.id }
        )

        return { recurringRule: newRecurringRule }
      })
    }
  )
}
