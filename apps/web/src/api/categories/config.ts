import { defineQueryKey } from '@/lib/react-query'

export const CATEGORIES_ENDPOINTS = {
  list: 'categories',
  detail: (id: string) => `categories/${id}`,
}

export const CATEGORIES_QUERY_KEYS = defineQueryKey({
  list: ['categories'],
})
