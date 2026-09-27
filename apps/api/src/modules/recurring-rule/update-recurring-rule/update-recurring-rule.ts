import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { z } from 'zod'

import { materializeRecurringOccurrence } from '@/modules/transaction/helpers/materialize-recurring-occurrence.js'
import { recalculateBalance } from '@/modules/transaction/helpers/recalculate-balance.js'
import { nextOccurrenceDate } from '@/modules/transaction/helpers/recurring-occurrences.js'
import { validateBankAccount } from '@/modules/transaction/helpers/validate-bank-account.js'
import { validateCategory } from '@/modules/transaction/helpers/validate-category.js'
import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { addDays } from '@/shared/helpers/date.js'
import { NotFound } from '@/shared/infra/http/errors/index.js'

import type { Prisma } from '../../../../generated/prisma/client.js'
import type { RecurringFrequency } from '../../../../generated/prisma/enums.js'
import {
  recurringRuleIdParam,
  updateRecurringRuleBody,
  updateRecurringRuleResponse,
} from '../schemas.js'

type UpdateInput = z.infer<typeof updateRecurringRuleBody>

type OccurrenceFields = {
  amount: number
  description: string
  bankAccountId: string
  categoryId: string | null
  notes: string | null
}

const OCCURRENCE_FIELD_KEYS = [
  'amount',
  'description',
  'bankAccountId',
  'categoryId',
  'notes',
] as const

function mergeOccurrenceFields(
  base: OccurrenceFields,
  input: UpdateInput
): OccurrenceFields {
  return {
    amount: input.amount ?? base.amount,
    description: input.description ?? base.description,
    bankAccountId: input.bankAccountId ?? base.bankAccountId,
    categoryId: input.categoryId ?? base.categoryId,
    notes: input.notes !== undefined ? input.notes : base.notes,
  }
}

function getChangedRuleFields(
  rule: OccurrenceFields,
  input: UpdateInput
): Partial<OccurrenceFields> {
  const changes: Partial<OccurrenceFields> = {}

  for (const key of OCCURRENCE_FIELD_KEYS) {
    const value = input[key]
    if (value !== undefined && value !== rule[key]) {
      Object.assign(changes, { [key]: value })
    }
  }

  return changes
}

function buildOccurrenceDateMapper(
  fromDate: Date,
  toDate: Date,
  frequency: RecurringFrequency
) {
  let oldCursor = fromDate
  let newCursor = toDate

  return (occurrenceDate: Date): Date | null => {
    while (oldCursor < occurrenceDate) {
      oldCursor = nextOccurrenceDate(oldCursor, frequency)
      newCursor = nextOccurrenceDate(newCursor, frequency)
    }

    if (oldCursor.getTime() !== occurrenceDate.getTime()) {
      return null
    }

    return newCursor
  }
}

function shiftDate(date: Date, from: Date, to: Date): Date {
  return new Date(date.getTime() + (to.getTime() - from.getTime()))
}

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
      const inputDate = input.date ? new Date(input.date) : undefined

      return app.prisma.$transaction(async (tx) => {
        const recurringRuleRepo = recurringRuleRepository(tx)
        const recurringOverrideRepo = recurringOverrideRepository(tx)
        const transactionRepo = transactionRepository(tx)
        const rule = await recurringRuleRepo.findById(request.params.id)

        if (!rule || rule.userId !== userId) {
          throw new NotFound('Regra de recorrência não encontrada')
        }

        if (input.bankAccountId) {
          await validateBankAccount(tx, userId, input.bankAccountId)
        }
        if (input.categoryId) {
          await validateCategory(tx, userId, input.categoryId)
        }

        if (input.scope === 'THIS') {
          const [currentOverride] = await recurringOverrideRepo.findMany({
            recurringRuleId: rule.id,
            occurrenceDate,
          })
          const current = currentOverride?.transaction ?? null
          const base = current ?? rule
          const fields = mergeOccurrenceFields(base, input)

          const transaction = await materializeRecurringOccurrence(tx, {
            ruleId: rule.id,
            occurrenceDate,
            transactionData: {
              ...fields,
              type: rule.type,
              date: inputDate ?? current?.date ?? occurrenceDate,
              isPaid: input.isPaid ?? current?.isPaid ?? false,
              userId,
            },
            existingTransactionId: current?.id,
            accountIdsToRecalculate: [base.bankAccountId, fields.bankAccountId],
          })

          return { transaction }
        }

        const newStartDate = inputDate ?? occurrenceDate
        const ruleFields = mergeOccurrenceFields(rule, input)
        const ruleChanges = getChangedRuleFields(rule, input)

        const movedOverrides = await recurringOverrideRepo.findMany({
          recurringRuleId: rule.id,
          occurrenceDate: { gte: occurrenceDate },
        })
        movedOverrides.sort(
          (a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime()
        )

        await recurringRuleRepo.update(rule.id, {
          endDate: addDays(occurrenceDate, -1),
        })

        const newRecurringRule = await recurringRuleRepo.create({
          type: rule.type,
          amount: ruleFields.amount,
          description: ruleFields.description,
          frequency: rule.frequency,
          startDate: newStartDate,
          endDate: rule.endDate,
          isPaid: rule.isPaid,
          notes: ruleFields.notes,
          userId,
          bankAccountId: ruleFields.bankAccountId,
          categoryId: ruleFields.categoryId ?? rule.categoryId,
        })

        await recurringOverrideRepo.deleteMany({
          id: { in: movedOverrides.map((override) => override.id) },
        })

        const affectedAccountIds = new Set([
          rule.bankAccountId,
          ruleFields.bankAccountId,
        ])
        const mapOccurrenceDate = buildOccurrenceDateMapper(
          occurrenceDate,
          newStartDate,
          rule.frequency
        )
        let hasCurrentOccurrence = false

        for (const override of movedOverrides) {
          const newOccurrenceDate =
            mapOccurrenceDate(override.occurrenceDate) ??
            override.occurrenceDate
          const isCurrent =
            override.occurrenceDate.getTime() === occurrenceDate.getTime()
          const { transaction } = override

          if (isCurrent) {
            hasCurrentOccurrence = true
          }

          if (transaction) {
            affectedAccountIds.add(transaction.bankAccountId)

            const updateData: Prisma.TransactionUncheckedUpdateInput = isCurrent
              ? {
                  ...mergeOccurrenceFields(transaction, input),
                  date: inputDate ?? transaction.date,
                  isPaid: input.isPaid ?? transaction.isPaid,
                }
              : {
                  ...ruleChanges,
                  date: shiftDate(
                    transaction.date,
                    override.occurrenceDate,
                    newOccurrenceDate
                  ),
                }

            const updated = await transactionRepo.update(
              transaction.id,
              updateData
            )
            affectedAccountIds.add(updated.bankAccountId)
          }

          await recurringOverrideRepo.create({
            recurringRuleId: newRecurringRule.id,
            occurrenceDate: newOccurrenceDate,
            isCancelled: override.isCancelled,
            transactionId: override.transactionId,
          })
        }

        if (!hasCurrentOccurrence && input.isPaid) {
          await materializeRecurringOccurrence(tx, {
            ruleId: newRecurringRule.id,
            occurrenceDate: newStartDate,
            transactionData: {
              ...ruleFields,
              type: rule.type,
              date: newStartDate,
              isPaid: true,
              userId,
            },
            accountIdsToRecalculate: [],
          })
        }

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }

        return { recurringRule: newRecurringRule }
      })
    }
  )
}
