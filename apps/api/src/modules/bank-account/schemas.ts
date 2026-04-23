import { z } from 'zod'

import { BankAccountType } from '../../../generated/prisma/enums.js'

export const bankAccountType = z.enum(BankAccountType)

export const bankAccountIdParam = z.object({
  id: z.uuid(),
})

export const bankAccountResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  type: bankAccountType,
  color: z.string(),
  icon: z.string(),
  initialBalance: z.int(),
  currentBalance: z.int(),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
