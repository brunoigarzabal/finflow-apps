import { defineQuery } from '@/lib/react-query'

import { TRANSACTIONS_QUERY_KEYS } from '../config'
import { getTransactionSummary } from '../endpoints'
import type { SummaryParams } from '../types'

export const useTransactionSummary = (params?: SummaryParams) =>
  defineQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEYS.summary, params],
    queryFn: () => getTransactionSummary(params),
  })()
