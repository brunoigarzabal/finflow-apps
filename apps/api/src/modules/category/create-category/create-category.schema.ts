import { z } from 'zod'

import { categoryType, categoryResponse } from '../schemas.js'

export const createCategoryBody = z.object({
  name: z.string().trim().min(1).max(50),
  type: categoryType,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  icon: z.string().default('tag-02'),
})

export { categoryResponse }
