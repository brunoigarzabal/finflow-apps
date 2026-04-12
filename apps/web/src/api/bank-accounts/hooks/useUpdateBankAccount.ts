import { useQueryClient } from '@tanstack/react-query'

import { defineMutation } from '@/lib/react-query'

import {
  BANK_ACCOUNTS_MUTATION_KEYS,
  BANK_ACCOUNTS_QUERY_KEYS,
} from '../config'
import { updateBankAccount } from '../endpoints'
import type { UpdateBankAccountBody } from '../types'

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient()

  return defineMutation({
    mutationKey: BANK_ACCOUNTS_MUTATION_KEYS.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateBankAccountBody }) =>
      updateBankAccount(id, body),
  })({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.list })
    },
  })
}
