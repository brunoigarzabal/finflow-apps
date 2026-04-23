import { z } from 'zod'

import { transactionType, transactionResponse, bankAccountBasic } from '../schemas.js'

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
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
})

export const transactionListItem = transactionResponse.extend({
  relatedBankAccount: bankAccountBasic.nullable(),
})

export const transactionListResponse = z.object({
  transactions: z.array(transactionListItem),
  pagination: z.object({
    page: z.int(),
    perPage: z.int(),
    total: z.int(),
    totalPages: z.int(),
  }),
})
