import { z } from 'zod'

export const balanceOverTimeQuery = z.object({
  bankAccountId: z.uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})

export const balanceOverTimeResponse = z.object({
  balanceOverTime: z.array(
    z.object({
      date: z.string(),
      balance: z.int(),
    }),
  ),
})
