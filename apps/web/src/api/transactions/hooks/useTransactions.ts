import { defineQuery } from '@/lib/react-query'

import { TRANSACTIONS_QUERY_KEYS } from '../config'
import { listTransactions } from '../endpoints'
import type { ListTransactionsParams } from '../types'

export const useTransactions = (params?: ListTransactionsParams) =>
  defineQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEYS.list, params],
    queryFn: () => listTransactions(params),
  })()
