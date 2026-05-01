import { httpClient } from '@/lib/httpClient'

import { BANK_ACCOUNTS_ENDPOINTS } from './config'
import type {
  BankAccount,
  BankAccountListResponse,
  CreateBankAccountBody,
  UpdateBankAccountBody,
} from './types'

export const listBankAccounts = (
  archived = false
): Promise<BankAccountListResponse> =>
  httpClient
    .authorized()
    .get(
      BANK_ACCOUNTS_ENDPOINTS.list,
      archived ? { searchParams: { archived: 'true' } } : undefined
    )
    .json<BankAccountListResponse>()

export const getBankAccount = (id: string): Promise<BankAccount> =>
  httpClient
    .authorized()
    .get(BANK_ACCOUNTS_ENDPOINTS.detail(id))
    .json<BankAccount>()

export const createBankAccount = (
  body: CreateBankAccountBody
): Promise<BankAccount> =>
  httpClient
    .authorized()
    .post(BANK_ACCOUNTS_ENDPOINTS.list, { json: body })
    .json<BankAccount>()

export const updateBankAccount = (
  id: string,
  body: UpdateBankAccountBody
): Promise<BankAccount> =>
  httpClient
    .authorized()
    .patch(BANK_ACCOUNTS_ENDPOINTS.detail(id), { json: body })
    .json<BankAccount>()

export const archiveBankAccount = (id: string): Promise<void> =>
  httpClient
    .authorized()
    .delete(BANK_ACCOUNTS_ENDPOINTS.detail(id))
    .then(() => undefined)

export const restoreBankAccount = (id: string): Promise<BankAccount> =>
  httpClient
    .authorized()
    .patch(BANK_ACCOUNTS_ENDPOINTS.restore(id))
    .json<BankAccount>()
