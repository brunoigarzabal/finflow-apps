import { z } from 'zod'

import { transactionType, transactionResponse, bankAccountBasic } from '../schemas.js'

export const createTransactionBody = z.object({
  type: transactionType,
  amount: z.int().min(1),
  description: z.string().trim().min(1).max(255),
  date: z.string().date(),
  bankAccountId: z.uuid(),
  categoryId: z.uuid().optional(),
  isPaid: z.boolean().default(true),
  notes: z.string().trim().max(500).nullable().optional(),
  destinationBankAccountId: z.uuid().optional(),
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
