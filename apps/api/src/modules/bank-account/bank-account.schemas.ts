import { z } from 'zod'

import { BankAccountType } from '../../../generated/prisma/enums.js'

const bankAccountName = z.string().trim().min(1).max(50)
const bankAccountType = z.enum(BankAccountType)
const bankAccountColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const bankAccountIcon = z.string()
const bankAccountBalance = z.int().min(0)

export const createBankAccountBody = z.object({
  name: bankAccountName,
  type: bankAccountType,
  color: bankAccountColor.default('#6366f1'),
  icon: bankAccountIcon.default('wallet-02'),
  initialBalance: bankAccountBalance.default(0),
})

export const updateBankAccountBody = z
  .object({
    name: bankAccountName,
    type: bankAccountType,
    color: bankAccountColor,
    icon: bankAccountIcon,
    initialBalance: bankAccountBalance,
  })
  .partial()

export const listBankAccountsQuery = z.object({
  archived: z.string().optional().transform((v) => v === 'true'),
})

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

export const bankAccountListResponse = z.object({
  bankAccounts: z.array(bankAccountResponse),
})
