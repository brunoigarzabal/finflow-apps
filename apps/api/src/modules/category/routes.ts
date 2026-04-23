import type { FastifyInstance } from 'fastify'

import { listCategoriesHandler } from './list-categories/list-categories.js'
import { getCategoryHandler } from './get-category/get-category.js'
import { createCategoryHandler } from './create-category/create-category.js'
import { updateCategoryHandler } from './update-category/update-category.js'
import { archiveCategoryHandler } from './archive-category/archive-category.js'
import { restoreCategoryHandler } from './restore-category/restore-category.js'

export async function categoryRoutes(app: FastifyInstance) {
  app.register(listCategoriesHandler)
  app.register(getCategoryHandler)
  app.register(createCategoryHandler)
  app.register(updateCategoryHandler)
  app.register(archiveCategoryHandler)
  app.register(restoreCategoryHandler)
}
