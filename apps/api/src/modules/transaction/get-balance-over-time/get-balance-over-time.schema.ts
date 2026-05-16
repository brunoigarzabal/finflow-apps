import { z } from 'zod'

export const balanceOverTimeQuery = z.object({
  bankAccountId: z.uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  includeUnpaid: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  groupBy: z.enum(['daily', 'weekly', 'monthly']).default('daily').optional(),
})

export const balanceOverTimeResponse = z.object({
  balanceOverTime: z.array(
    z.object({
      date: z.string(),
      income: z.int().nonnegative(),
      expense: z.int().nonnegative(),
      balance: z.int(),
    })
  ),
})
