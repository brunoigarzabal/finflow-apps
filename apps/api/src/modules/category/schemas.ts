import { z } from 'zod'

import { CategoryType } from '../../../generated/prisma/enums.js'

export const categoryType = z.enum(CategoryType)

export const categoryIdParam = z.object({
  id: z.uuid(),
})

export const categoryResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  type: categoryType,
  color: z.string(),
  icon: z.string(),
  slug: z.string().nullable(),
  isDefault: z.boolean(),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
