import { defineQuery } from '@/lib/react-query'

import { CATEGORIES_QUERY_KEYS } from '../config'
import { listCategories } from '../endpoints'
import type { ListCategoriesParams } from '../types'

export const useCategories = (params?: ListCategoriesParams) =>
  defineQuery({
    queryKey: [...CATEGORIES_QUERY_KEYS.list, params],
    queryFn: () => listCategories(params),
  })()
