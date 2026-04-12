import { httpClient } from '@/lib/httpClient'

import { CATEGORIES_ENDPOINTS } from './config'
import type { CategoryListResponse, ListCategoriesParams } from './types'

export const listCategories = (
  params?: ListCategoriesParams
): Promise<CategoryListResponse> =>
  httpClient
    .authorized()
    .get(
      CATEGORIES_ENDPOINTS.list,
      params ? { searchParams: params as Record<string, string> } : undefined
    )
    .json<CategoryListResponse>()
