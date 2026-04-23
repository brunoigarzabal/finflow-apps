import { z } from 'zod'

import { bankAccountType, bankAccountResponse } from '../schemas.js'

export const createBankAccountBody = z.object({
  name: z.string().trim().min(1).max(50),
  type: bankAccountType,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  icon: z.string().default('wallet-02'),
  initialBalance: z.int().min(0).default(0),
})

export { bankAccountResponse }
