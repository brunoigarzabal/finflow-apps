import { z } from 'zod'

import { RecurringFrequency } from '../../../../generated/prisma/enums.js'
import {
  installmentScope,
  transactionIdParam,
  transactionResponse,
} from '../schemas.js'

export const updateTransactionBody = z
  .object({
    amount: z.int().min(1),
    description: z.string().trim().min(1).max(255),
    date: z.string().date(),
    bankAccountId: z.uuid(),
    categoryId: z.uuid(),
    isPaid: z.boolean(),
    notes: z.string().trim().max(500).nullable(),
    scope: installmentScope,
    recurring: z.object({
      frequency: z.enum(RecurringFrequency),
      endDate: z.string().date().optional(),
    }),
  })
  .partial()

export { transactionIdParam, transactionResponse }
