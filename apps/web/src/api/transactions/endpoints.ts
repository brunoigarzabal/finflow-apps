import { httpClient } from '@/lib/httpClient'

import { TRANSACTIONS_ENDPOINTS } from './config'
import type {
  BalanceOverTimeParams,
  BalanceOverTimeResponse,
  CreateTransactionBody,
  CreateTransactionResponse,
  DeleteTransactionBody,
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

export const getBalanceOverTime = (
  params?: BalanceOverTimeParams
): Promise<BalanceOverTimeResponse> => {
  const searchParams = params
    ? {
        ...params,
        includeUnpaid: params.includeUnpaid ? 'true' : undefined,
        groupBy: params.groupBy,
      }
    : undefined

  return httpClient
    .authorized()
    .get(
      TRANSACTIONS_ENDPOINTS.balanceOverTime,
      searchParams
        ? { searchParams: searchParams as Record<string, string> }
        : undefined
    )
    .json<BalanceOverTimeResponse>()
}

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
): Promise<CreateTransactionResponse> =>
  httpClient
    .authorized()
    .post(TRANSACTIONS_ENDPOINTS.create, { json: body })
    .json<CreateTransactionResponse>()

export const updateTransaction = (
  id: string,
  body: UpdateTransactionBody
): Promise<TransactionDetail> =>
  httpClient
    .authorized()
    .patch(TRANSACTIONS_ENDPOINTS.update(id), { json: body })
    .json<TransactionDetail>()

export const deleteTransaction = (
  id: string,
  body?: DeleteTransactionBody
): Promise<void> =>
  httpClient
    .authorized()
    .delete(TRANSACTIONS_ENDPOINTS.delete(id), { json: body ?? {} })
    .then(() => undefined)
