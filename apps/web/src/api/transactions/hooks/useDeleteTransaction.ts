import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import { TRANSACTIONS_MUTATION_KEYS } from '../config'
import { deleteTransaction } from '../endpoints'
import { invalidateTransactionDependencies } from '../invalidateTransactionDependencies'
import type { DeleteTransactionBody } from '../types'

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: TRANSACTIONS_MUTATION_KEYS.delete,
    mutationFn: ({ id, body }: { id: string; body?: DeleteTransactionBody }) =>
      deleteTransaction(id, body),
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
