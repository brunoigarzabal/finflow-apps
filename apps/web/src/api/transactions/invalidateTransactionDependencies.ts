import type { QueryClient } from '@tanstack/react-query'

import { BANK_ACCOUNTS_QUERY_KEYS } from '@/api/bank-accounts/config'
import { DASHBOARD_QUERY_KEYS } from '@/api/dashboard/config'
import { RECURRING_RULES_QUERY_KEYS } from '@/api/recurring-rules/config'

import { TRANSACTIONS_QUERY_KEYS } from './config'

export const invalidateTransactionDependencies = (
  queryClient: QueryClient
): void => {
  queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.list })
  queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.summary })
  queryClient.invalidateQueries({
    queryKey: TRANSACTIONS_QUERY_KEYS.summaryByCategory,
  })
  queryClient.invalidateQueries({ queryKey: RECURRING_RULES_QUERY_KEYS.list })
  queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.list })
  queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.detail })
}
