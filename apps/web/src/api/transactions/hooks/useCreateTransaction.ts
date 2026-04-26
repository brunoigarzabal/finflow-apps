import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { TRANSACTIONS_MUTATION_KEYS } from '../config'
import { createTransaction } from '../endpoints'
import { invalidateTransactionDependencies } from '../invalidateTransactionDependencies'

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: TRANSACTIONS_MUTATION_KEYS.create,
    mutationFn: createTransaction,
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
