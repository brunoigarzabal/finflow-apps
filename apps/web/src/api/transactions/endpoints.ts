import { httpClient } from '@/lib/httpClient'

import { TRANSACTIONS_ENDPOINTS } from './config'
import type {
  CreateTransactionBody,
  ListTransactionsParams,
  SummaryByCategoryParams,
  SummaryByCategoryResponse,
  SummaryParams,
  TransactionDetail,
  TransactionListResponse,
  TransactionSummary,
  UpdateTransactionBody,
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
    .json<{ summary: TransactionSummary }>()
    .then((res) => res.summary)

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

export const getTransaction = (id: string): Promise<TransactionDetail> =>
  httpClient
    .authorized()
    .get(TRANSACTIONS_ENDPOINTS.detail(id))
    .json<TransactionDetail>()

export const createTransaction = (
  body: CreateTransactionBody
): Promise<TransactionDetail> =>
  httpClient
    .authorized()
    .post(TRANSACTIONS_ENDPOINTS.create, { json: body })
    .json<TransactionDetail>()

export const updateTransaction = (
  id: string,
  body: UpdateTransactionBody
): Promise<TransactionDetail> =>
  httpClient
    .authorized()
    .patch(TRANSACTIONS_ENDPOINTS.update(id), { json: body })
    .json<TransactionDetail>()

export const deleteTransaction = (id: string): Promise<void> =>
  httpClient
    .authorized()
    .delete(TRANSACTIONS_ENDPOINTS.delete(id))
    .then(() => undefined)
