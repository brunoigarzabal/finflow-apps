import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import {
  BANK_ACCOUNTS_MUTATION_KEYS,
  BANK_ACCOUNTS_QUERY_KEYS,
} from '../config'
import { archiveBankAccount } from '../endpoints'

export const useArchiveBankAccount = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: BANK_ACCOUNTS_MUTATION_KEYS.archive,
    mutationFn: archiveBankAccount,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.list })
      queryClient.invalidateQueries({
        queryKey: BANK_ACCOUNTS_QUERY_KEYS.listArchived,
      })
    },
  })
}
