import { defineQuery } from '@/lib/react-query'

import { TRANSACTIONS_QUERY_KEYS } from '../config'
import { getTransaction } from '../endpoints'

export const useTransaction = (id: string) =>
  defineQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEYS.detail, id],
    queryFn: () => getTransaction(id),
  })({ enabled: !!id })
