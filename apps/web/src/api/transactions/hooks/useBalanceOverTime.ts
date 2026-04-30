import { defineQuery } from '@/lib/react-query'

import { TRANSACTIONS_QUERY_KEYS } from '../config'
import { getBalanceOverTime } from '../endpoints'
import type { BalanceOverTimeParams } from '../types'

export const useBalanceOverTime = (params?: BalanceOverTimeParams) =>
  defineQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEYS.balanceOverTime, params],
    queryFn: () => getBalanceOverTime(params),
  })()
