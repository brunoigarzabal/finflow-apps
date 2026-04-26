import { useQueryStates } from 'nuqs'
import { useCallback } from 'react'

import type { TransactionFilterValues } from '../transactionQueryParams'
import {
  formatPeriod,
  getPeriodDate,
  getTransactionFilters,
  toTransactionListParams,
  toTransactionSummaryParams,
  transactionQueryParsers,
} from '../transactionQueryParams'

export const useTransactionQueryState = () => {
  const [queryFilters, setQueryFilters] = useQueryStates(
    transactionQueryParsers
  )

  const currentMonth = getPeriodDate(queryFilters.period)
  const filters = getTransactionFilters(queryFilters)
  const queryParams = toTransactionListParams(queryFilters)
  const summaryParams = toTransactionSummaryParams(queryFilters)

  const handleMonthChange = useCallback(
    (month: Date) => {
      void setQueryFilters({ period: formatPeriod(month) })
    },
    [setQueryFilters]
  )

  const handleFilterChange = useCallback(
    (values: TransactionFilterValues) => {
      void setQueryFilters(values)
    },
    [setQueryFilters]
  )

  return {
    currentMonth,
    filters,
    queryParams,
    summaryParams,
    handleMonthChange,
    handleFilterChange,
  }
}
