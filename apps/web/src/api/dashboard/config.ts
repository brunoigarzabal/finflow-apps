import { defineQueryKey } from '@/lib/react-query'

export const DASHBOARD_ENDPOINTS = {
  detail: 'dashboard',
}

export const DASHBOARD_QUERY_KEYS = defineQueryKey({
  detail: ['dashboard'],
})
