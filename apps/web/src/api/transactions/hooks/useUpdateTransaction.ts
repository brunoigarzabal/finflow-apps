import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { TRANSACTIONS_MUTATION_KEYS } from '../config'
import { updateTransaction } from '../endpoints'
import { invalidateTransactionDependencies } from '../invalidateTransactionDependencies'
import type { UpdateTransactionBody } from '../types'

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: TRANSACTIONS_MUTATION_KEYS.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateTransactionBody }) =>
      updateTransaction(id, body),
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
