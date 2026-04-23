import { z } from 'zod'

import { bankAccountResponse } from '../schemas.js'

export const listBankAccountsQuery = z.object({
  archived: z.string().optional().transform((v) => v === 'true'),
})

export const bankAccountListResponse = z.object({
  bankAccounts: z.array(bankAccountResponse),
})
