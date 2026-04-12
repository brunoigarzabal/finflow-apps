import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { BANK_ACCOUNTS_QUERY_KEYS } from '../../bank-accounts/config'
import { DASHBOARD_QUERY_KEYS } from '../../dashboard/config'
import { TRANSACTIONS_MUTATION_KEYS, TRANSACTIONS_QUERY_KEYS } from '../config'
import { updateTransaction } from '../endpoints'
import type { UpdateTransactionBody } from '../types'

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: TRANSACTIONS_MUTATION_KEYS.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateTransactionBody }) =>
      updateTransaction(id, body),
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
