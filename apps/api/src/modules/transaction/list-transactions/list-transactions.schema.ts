import { z } from 'zod'

import {
  transactionType,
  transactionResponse,
  bankAccountBasic,
} from '../schemas.js'

const transactionDate = z.string().date()

export const listTransactionsQuery = z.object({
  bankAccountId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  type: transactionType.optional(),
  startDate: transactionDate.optional(),
  endDate: transactionDate.optional(),
  isPaid: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})

export const transactionListItem = transactionResponse.extend({
  id: z.string(),
  relatedBankAccount: bankAccountBasic.nullable(),
})

export const transactionListResponse = z.object({
  transactions: z.array(transactionListItem),
})
