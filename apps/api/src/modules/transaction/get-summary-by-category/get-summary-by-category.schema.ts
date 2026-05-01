import { z } from 'zod'

import { CategoryType } from '../../../../generated/prisma/enums.js'

export const summaryByCategoryQuery = z.object({
  type: z.enum(CategoryType),
  bankAccountId: z.uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  isPaid: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export const summaryByCategoryResponse = z.object({
  summaryByCategory: z.array(
    z.object({
      categoryId: z.uuid(),
      categoryName: z.string(),
      categoryColor: z.string(),
      categoryIcon: z.string(),
      totalAmount: z.int(),
      transactionCount: z.int(),
      percentageOfTotal: z.number(),
    })
  ),
  total: z.int(),
})
