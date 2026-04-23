import { z } from 'zod'

import { transactionIdParam, transactionResponse } from '../schemas.js'

export const updateTransactionBody = z
  .object({
    amount: z.int().min(1),
    description: z.string().trim().min(1).max(255),
    date: z.string().date(),
    bankAccountId: z.uuid(),
    categoryId: z.uuid(),
    isPaid: z.boolean(),
    notes: z.string().trim().max(500).nullable(),
  })
  .partial()

export { transactionIdParam, transactionResponse }
