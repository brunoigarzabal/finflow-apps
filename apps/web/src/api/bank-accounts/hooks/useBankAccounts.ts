import { defineQuery } from '@/lib/react-query'

import { BANK_ACCOUNTS_QUERY_KEYS } from '../config'
import { listBankAccounts } from '../endpoints'

export const useBankAccounts = (archived = false) =>
  defineQuery({
    queryKey: archived
      ? BANK_ACCOUNTS_QUERY_KEYS.listArchived
      : BANK_ACCOUNTS_QUERY_KEYS.list,
    queryFn: () => listBankAccounts(archived),
  })()
