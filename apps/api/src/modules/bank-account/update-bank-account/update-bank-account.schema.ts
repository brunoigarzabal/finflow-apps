import { z } from 'zod'

import { bankAccountType, bankAccountIdParam, bankAccountResponse } from '../schemas.js'

export const updateBankAccountBody = z
  .object({
    name: z.string().trim().min(1).max(50),
    type: bankAccountType,
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    icon: z.string(),
    initialBalance: z.int().min(0),
  })
  .partial()

export { bankAccountIdParam, bankAccountResponse }
