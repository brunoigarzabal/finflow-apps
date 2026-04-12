import { defineQuery } from '@/lib/react-query'

import { getBankAccount } from '../endpoints'

export const useBankAccount = (id: string) =>
  defineQuery({
    queryKey: ['bank-accounts', id],
    queryFn: () => getBankAccount(id),
  })()
