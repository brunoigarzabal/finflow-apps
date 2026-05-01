import { z } from 'zod'

export const summaryByPeriodQuery = z.object({
  bankAccountId: z.uuid().optional(),
  months: z.coerce.number().int().min(2).max(24).default(12),
})

export const summaryByPeriodResponse = z.object({
  summaryByPeriod: z.array(
    z.object({
      month: z.string(),
      totalIncome: z.int(),
      totalExpense: z.int(),
      balance: z.int(),
    })
  ),
})
