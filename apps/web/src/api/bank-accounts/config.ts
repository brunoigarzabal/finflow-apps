import { defineQueryKey, defineMutationKey } from '@/lib/react-query'

export const BANK_ACCOUNTS_ENDPOINTS = {
  list: 'bank-accounts',
  detail: (id: string) => `bank-accounts/${id}`,
  restore: (id: string) => `bank-accounts/${id}/restore`,
}

export const BANK_ACCOUNTS_QUERY_KEYS = defineQueryKey({
  list: ['bank-accounts'],
  listArchived: ['bank-accounts', 'archived'],
})

export const BANK_ACCOUNTS_MUTATION_KEYS = defineMutationKey({
  create: ['bank-accounts', 'create'],
  update: ['bank-accounts', 'update'],
  archive: ['bank-accounts', 'archive'],
  restore: ['bank-accounts', 'restore'],
})
