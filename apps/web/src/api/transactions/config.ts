import { defineQueryKey } from '@/lib/react-query'

export const TRANSACTIONS_ENDPOINTS = {
  list: 'transactions',
  summary: 'transactions/summary',
  summaryByCategory: 'transactions/summary-by-category',
}

export const TRANSACTIONS_QUERY_KEYS = defineQueryKey({
  list: ['transactions'],
  summary: ['transactions', 'summary'],
  summaryByCategory: ['transactions', 'summary-by-category'],
})
