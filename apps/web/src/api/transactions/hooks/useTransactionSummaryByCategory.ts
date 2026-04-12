import { defineQuery } from '@/lib/react-query'

import { TRANSACTIONS_QUERY_KEYS } from '../config'
import { getSummaryByCategory } from '../endpoints'
import type { SummaryByCategoryParams } from '../types'

export const useTransactionSummaryByCategory = (
  params?: SummaryByCategoryParams
) =>
  defineQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEYS.summaryByCategory, params],
    queryFn: () => getSummaryByCategory(params),
  })()
