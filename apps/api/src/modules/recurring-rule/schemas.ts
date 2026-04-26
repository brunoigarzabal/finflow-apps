import { z } from 'zod'

import { RecurringFrequency } from '../../../generated/prisma/enums.js'
import { bankAccountBasic, categoryBasic, transactionResponse, transactionType } from '../transaction/schemas.js'

export const recurringRuleIdParam = z.object({
  id: z.uuid(),
})

export const recurringScope = z.enum(['THIS', 'THIS_AND_FUTURE'])

export const recurringRuleResponse = z.object({
  id: z.uuid(),
  type: transactionType,
  amount: z.int(),
  description: z.string(),
  frequency: z.enum(RecurringFrequency),
  startDate: z.date(),
  endDate: z.date().nullable(),
  isPaid: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bankAccount: bankAccountBasic,
  category: categoryBasic,
})

export const listRecurringRulesResponse = z.object({
  recurringRules: z.array(recurringRuleResponse),
})

export const updateRecurringRuleBody = z.object({
  scope: recurringScope,
  occurrenceDate: z.string().date(),
  amount: z.int().min(1).optional(),
  description: z.string().trim().min(1).max(255).optional(),
  categoryId: z.uuid().optional(),
  bankAccountId: z.uuid().optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
})

export const updateRecurringRuleResponse = z.object({
  recurringRule: recurringRuleResponse.optional(),
  transaction: transactionResponse.optional(),
})

export const deleteOccurrenceBody = z.object({
  occurrenceDate: z.string().date(),
  scope: recurringScope,
})

export const deleteRecurringRuleBody = z.object({
  endDate: z.string().date(),
})
