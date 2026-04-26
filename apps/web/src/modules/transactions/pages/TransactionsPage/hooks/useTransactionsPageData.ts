import { useMemo } from 'react'

import { useBankAccounts } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import { useRecurringRules } from '@/api/recurring-rules'
import {
  useTransactions,
  useTransactionSummary,
  type ListTransactionsParams,
  type SummaryParams,
} from '@/api/transactions'

type Params = {
  queryParams: ListTransactionsParams
  summaryParams: SummaryParams
}

export const useTransactionsPageData = ({
  queryParams,
  summaryParams,
}: Params) => {
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useTransactions(queryParams)
  const { data: summaryData, isLoading: isLoadingSummary } =
    useTransactionSummary(summaryParams)
  const { data: bankAccountsData } = useBankAccounts()
  const { data: categoriesData } = useCategories()
  const { data: recurringRulesData } = useRecurringRules()

  const recurringRules = useMemo(
    () => recurringRulesData?.recurringRules ?? [],
    [recurringRulesData?.recurringRules]
  )

  return {
    transactions: transactionsData?.transactions ?? [],
    summary: summaryData,
    bankAccounts: bankAccountsData?.bankAccounts ?? [],
    categories: categoriesData?.categories ?? [],
    recurringRules,
    isLoadingTransactions,
    isLoadingSummary,
  }
}
