import { z } from 'zod'

import { CategoryType } from '../../../../generated/prisma/enums.js'
import { categoryResponse } from '../schemas.js'

export const listCategoriesQuery = z.object({
  type: z.enum(CategoryType).optional(),
  archived: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export const categoryListResponse = z.object({
  categories: z.array(categoryResponse),
})
