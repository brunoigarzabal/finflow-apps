import { z } from 'zod'

import { CategoryType } from '../../../generated/prisma/enums.js'

const categoryName = z.string().trim().min(1).max(50)
const categoryType = z.enum(CategoryType)
const categoryColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const categoryIcon = z.string()

export const createCategoryBody = z.object({
  name: categoryName,
  type: categoryType,
  color: categoryColor.default('#6366f1'),
  icon: categoryIcon.default('tag-02'),
})

export const updateCategoryBody = z
  .object({
    name: categoryName,
    color: categoryColor,
    icon: categoryIcon,
  })
  .partial()

export const listCategoriesQuery = z.object({
  type: z.enum(CategoryType).optional(),
  archived: z.string().optional().transform((v) => v === 'true'),
})

export const categoryIdParam = z.object({
  id: z.uuid(),
})

export const categoryResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  type: categoryType,
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const categoryListResponse = z.object({
  categories: z.array(categoryResponse),
})
