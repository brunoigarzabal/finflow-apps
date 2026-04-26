import { useQueryClient } from '@tanstack/react-query'

import { invalidateTransactionDependencies } from '@/api/transactions/invalidateTransactionDependencies'
import { defineMutation } from '@/lib/react-query'

import { RECURRING_RULES_MUTATION_KEYS } from '../config'
import { updateRecurringRule } from '../endpoints'
import type { UpdateRecurringRuleBody } from '../types'

export const useUpdateRecurringRule = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: RECURRING_RULES_MUTATION_KEYS.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateRecurringRuleBody }) =>
      updateRecurringRule(id, body),
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
