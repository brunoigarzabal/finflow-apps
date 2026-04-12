import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { BANK_ACCOUNTS_QUERY_KEYS } from '../../bank-accounts/config'
import { DASHBOARD_QUERY_KEYS } from '../../dashboard/config'
import { TRANSACTIONS_MUTATION_KEYS, TRANSACTIONS_QUERY_KEYS } from '../config'
import { createTransaction } from '../endpoints'

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: TRANSACTIONS_MUTATION_KEYS.create,
    mutationFn: createTransaction,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.list })
      queryClient.invalidateQueries({
        queryKey: TRANSACTIONS_QUERY_KEYS.summary,
      })
      queryClient.invalidateQueries({
        queryKey: TRANSACTIONS_QUERY_KEYS.summaryByCategory,
      })
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.list })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.detail })
    },
  })
}
