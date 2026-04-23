import { z } from 'zod'

import { categoryIdParam, categoryResponse } from '../schemas.js'

export const updateCategoryBody = z
  .object({
    name: z.string().trim().min(1).max(50),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    icon: z.string(),
  })
  .partial()

export { categoryIdParam, categoryResponse }
