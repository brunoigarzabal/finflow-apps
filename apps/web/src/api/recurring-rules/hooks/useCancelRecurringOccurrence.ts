import { useQueryClient } from '@tanstack/react-query'

import { invalidateTransactionDependencies } from '@/api/transactions/invalidateTransactionDependencies'
import { defineMutation } from '@/lib/react-query'

import { RECURRING_RULES_MUTATION_KEYS } from '../config'
import { cancelRecurringOccurrence } from '../endpoints'
import type { CancelRecurringOccurrenceBody } from '../types'

export const useCancelRecurringOccurrence = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: RECURRING_RULES_MUTATION_KEYS.cancelOccurrence,
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: CancelRecurringOccurrenceBody
    }) => cancelRecurringOccurrence(id, body),
  })({
    onSuccess: () => {
      invalidateTransactionDependencies(queryClient)
    },
  })
}
