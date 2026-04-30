import { defineQueryKey, defineMutationKey } from '@/lib/react-query'

export const TRANSACTIONS_ENDPOINTS = {
  list: 'transactions',
  detail: (id: string) => `transactions/${id}`,
  create: 'transactions',
  update: (id: string) => `transactions/${id}`,
  delete: (id: string) => `transactions/${id}`,
  summary: 'transactions/summary',
  summaryByCategory: 'transactions/summary-by-category',
  balanceOverTime: 'transactions/balance-over-time',
}

export const TRANSACTIONS_QUERY_KEYS = defineQueryKey({
  list: ['transactions'],
  detail: ['transactions', 'detail'],
  summary: ['transactions', 'summary'],
  summaryByCategory: ['transactions', 'summary-by-category'],
  balanceOverTime: ['transactions', 'balance-over-time'],
})

export const TRANSACTIONS_MUTATION_KEYS = defineMutationKey({
  create: ['transactions', 'create'],
  update: ['transactions', 'update'],
  delete: ['transactions', 'delete'],
})
