import { z } from 'zod'

import { TransactionType } from '../../../generated/prisma/enums.js'

export const transactionType = z.enum(TransactionType)

export const transactionIdParam = z.object({
  id: z.uuid(),
})

export const installmentScope = z.enum(['THIS', 'ALL_REMAINING'])

export const bankAccountBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

export const categoryBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

export const transactionResponse = z.object({
  id: z.uuid(),
  type: transactionType,
  amount: z.int(),
  description: z.string(),
  date: z.date(),
  isPaid: z.boolean(),
  notes: z.string().nullable(),
  transferId: z.string().nullable(),
  isTransferOut: z.boolean().nullable(),
  installmentGroupId: z.uuid().nullable(),
  installmentNumber: z.int().nullable(),
  recurringRuleId: z.uuid().optional(),
  isVirtual: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bankAccount: bankAccountBasic,
  category: categoryBasic.nullable(),
})
