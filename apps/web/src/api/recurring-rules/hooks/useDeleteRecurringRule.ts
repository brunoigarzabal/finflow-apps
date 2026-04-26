import { useQueryClient } from '@tanstack/react-query'

import { invalidateTransactionDependencies } from '@/api/transactions/invalidateTransactionDependencies'
import { defineMutation } from '@/lib/react-query'

import { RECURRING_RULES_MUTATION_KEYS } from '../config'
import { deleteRecurringRule } from '../endpoints'
import type { DeleteRecurringRuleBody } from '../types'

export const useDeleteRecurringRule = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: RECURRING_RULES_MUTATION_KEYS.delete,
    mutationFn: ({ id, body }: { id: string; body: DeleteRecurringRuleBody }) =>
      deleteRecurringRule(id, body),
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
