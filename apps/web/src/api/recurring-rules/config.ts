import { defineMutationKey, defineQueryKey } from '@/lib/react-query'

export const RECURRING_RULES_ENDPOINTS = {
  list: 'recurring-rules',
  update: (id: string) => `recurring-rules/${id}`,
  cancelOccurrence: (id: string) => `recurring-rules/${id}/occurrence`,
  delete: (id: string) => `recurring-rules/${id}`,
}

export const RECURRING_RULES_QUERY_KEYS = defineQueryKey({
  list: ['recurring-rules'],
})

export const RECURRING_RULES_MUTATION_KEYS = defineMutationKey({
  update: ['recurring-rules', 'update'],
  cancelOccurrence: ['recurring-rules', 'cancel-occurrence'],
  delete: ['recurring-rules', 'delete'],
})
