import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import {
  BANK_ACCOUNTS_MUTATION_KEYS,
  BANK_ACCOUNTS_QUERY_KEYS,
} from '../config'
import { setDefaultBankAccount } from '../endpoints'

export const useSetDefaultBankAccount = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: BANK_ACCOUNTS_MUTATION_KEYS.setDefault,
    mutationFn: setDefaultBankAccount,
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.list })
    },
  })
}
