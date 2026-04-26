import { defineQuery } from '@/lib/react-query'

import { RECURRING_RULES_QUERY_KEYS } from '../config'
import { listRecurringRules } from '../endpoints'

export const useRecurringRules = () =>
  defineQuery({
    queryKey: RECURRING_RULES_QUERY_KEYS.list,
    queryFn: listRecurringRules,
  })()
