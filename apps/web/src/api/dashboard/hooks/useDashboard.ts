import { defineQuery } from '@/lib/react-query'

import { DASHBOARD_QUERY_KEYS } from '../config'
import { getDashboard } from '../endpoints'

export const useDashboard = (bankAccountId?: string) =>
  defineQuery({
    queryKey: [...DASHBOARD_QUERY_KEYS.detail, bankAccountId],
    queryFn: () => getDashboard(bankAccountId),
  })()
