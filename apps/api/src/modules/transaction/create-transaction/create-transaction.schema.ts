import { z } from 'zod'

import { RecurringFrequency } from '../../../../generated/prisma/enums.js'
import { recurringRuleResponse } from '../../recurring-rule/schemas.js'
import {
  transactionType,
  transactionResponse,
  bankAccountBasic,
} from '../schemas.js'

export const createTransactionBody = z
  .object({
    type: transactionType,
    amount: z.int().min(1),
    description: z.string().trim().min(1).max(255),
    date: z.string().date(),
    bankAccountId: z.uuid(),
    categoryId: z.uuid().optional(),
    isPaid: z.boolean().default(true),
    notes: z.string().trim().max(500).nullable().optional(),
    destinationBankAccountId: z.uuid().optional(),
    installment: z
      .object({
        count: z.int().min(2).max(72),
        frequency: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY']),
      })
      .optional(),
    recurring: z
      .object({
        frequency: z.enum(RecurringFrequency),
        endDate: z.string().date().optional(),
      })
      .optional(),
  })
  .superRefine((input, ctx) => {
    if (input.installment && input.recurring) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe apenas parcelamento ou recorrência',
        path: ['installment'],
      })
    }
  })

export const transactionDetailResponse = transactionResponse.extend({
  relatedTransaction: z
    .object({
      id: z.uuid(),
      amount: z.int(),
      type: transactionType,
      bankAccount: bankAccountBasic,
    })
    .nullable(),
})

const installmentGroupResponse = z.object({
  id: z.uuid(),
  totalAmount: z.int(),
  count: z.int(),
  frequency: z.enum(RecurringFrequency),
  createdAt: z.date(),
})

export const createTransactionResponse = z.union([
  transactionDetailResponse,
  z.object({
    installmentGroup: installmentGroupResponse,
    transactions: z.array(transactionResponse),
  }),
  z.object({
    recurringRule: recurringRuleResponse,
  }),
])
