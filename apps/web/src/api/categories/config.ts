import { defineMutationKey, defineQueryKey } from '@/lib/react-query'

export const CATEGORIES_ENDPOINTS = {
  list: 'categories',
  detail: (id: string) => `categories/${id}`,
  restore: (id: string) => `categories/${id}/restore`,
}

export const CATEGORIES_QUERY_KEYS = defineQueryKey({
  list: ['categories'],
  listArchived: ['categories', 'archived'],
})

export const CATEGORIES_MUTATION_KEYS = defineMutationKey({
  create: ['categories', 'create'],
  update: ['categories', 'update'],
  archive: ['categories', 'archive'],
  restore: ['categories', 'restore'],
})
