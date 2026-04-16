import { httpClient } from '@/lib/httpClient'

import { CATEGORIES_ENDPOINTS } from './config'
import type {
  Category,
  CategoryListResponse,
  CreateCategoryBody,
  ListCategoriesParams,
  UpdateCategoryBody,
} from './types'

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

export const getCategory = (id: string): Promise<Category> =>
  httpClient.authorized().get(CATEGORIES_ENDPOINTS.detail(id)).json<Category>()

export const createCategory = (body: CreateCategoryBody): Promise<Category> =>
  httpClient
    .authorized()
    .post(CATEGORIES_ENDPOINTS.list, { json: body })
    .json<Category>()

export const updateCategory = (
  id: string,
  body: UpdateCategoryBody
): Promise<Category> =>
  httpClient
    .authorized()
    .patch(CATEGORIES_ENDPOINTS.detail(id), { json: body })
    .json<Category>()

export const archiveCategory = (id: string): Promise<void> =>
  httpClient
    .authorized()
    .delete(CATEGORIES_ENDPOINTS.detail(id))
    .then(() => undefined)

export const restoreCategory = (id: string): Promise<Category> =>
  httpClient
    .authorized()
    .patch(CATEGORIES_ENDPOINTS.restore(id))
    .json<Category>()
