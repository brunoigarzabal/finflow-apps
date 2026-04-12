import { httpClient } from '@/lib/httpClient'

import { TRANSACTIONS_ENDPOINTS } from './config'
import type {
  ListTransactionsParams,
  SummaryByCategoryParams,
  SummaryByCategoryResponse,
  SummaryParams,
  TransactionListResponse,
  TransactionSummary,
} from './types'

export const getTransactionSummary = (
  params?: SummaryParams
): Promise<TransactionSummary> =>
  httpClient
    .authorized()
    .get(
      TRANSACTIONS_ENDPOINTS.summary,
      params ? { searchParams: params as Record<string, string> } : undefined
    )
    .json<TransactionSummary>()

export const getSummaryByCategory = (
  params?: SummaryByCategoryParams
): Promise<SummaryByCategoryResponse> =>
  httpClient
    .authorized()
    .get(
      TRANSACTIONS_ENDPOINTS.summaryByCategory,
      params ? { searchParams: params as Record<string, string> } : undefined
    )
    .json<SummaryByCategoryResponse>()

export const listTransactions = (
  params?: ListTransactionsParams
): Promise<TransactionListResponse> =>
  httpClient
    .authorized()
    .get(
      TRANSACTIONS_ENDPOINTS.list,
      params ? { searchParams: params as Record<string, string> } : undefined
    )
    .json<TransactionListResponse>()
