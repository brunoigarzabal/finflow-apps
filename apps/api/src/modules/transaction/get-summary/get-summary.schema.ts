import { z } from 'zod'

export const summaryQuery = z.object({
  bankAccountId: z.uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})

export const summaryResponse = z.object({
  summary: z.object({
    previousBalance: z.int(),
    totalIncome: z.int(),
    totalExpense: z.int(),
    balance: z.int(),
    pendingIncome: z.int(),
    pendingExpense: z.int(),
    pendingBalance: z.int(),
  }),
})
