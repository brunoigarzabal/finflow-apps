import { z } from 'zod'

import {
  BankAccountType,
  TransactionType,
} from '../../../../generated/prisma/enums.js'

const bankAccountBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

const categoryBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

export const dashboardQuery = z.object({
  bankAccountId: z.uuid().optional(),
})

export const dashboardResponse = z.object({
  bankAccounts: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      type: z.enum(BankAccountType),
      color: z.string(),
      icon: z.string(),
      currentBalance: z.int(),
    })
  ),
  totalBalance: z.int(),
  summary: z.object({
    totalIncome: z.int(),
    totalExpense: z.int(),
    balance: z.int(),
  }),
  recentTransactions: z.array(
    z.object({
      id: z.uuid(),
      type: z.enum(TransactionType),
      amount: z.int(),
      description: z.string(),
      date: z.date(),
      isPaid: z.boolean(),
      bankAccount: bankAccountBasic,
      category: categoryBasic.nullable(),
    })
  ),
})
