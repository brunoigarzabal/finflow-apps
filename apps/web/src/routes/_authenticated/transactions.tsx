import { createFileRoute } from '@tanstack/react-router'

import { TransactionsPage } from '@/modules/transactions'

export const Route = createFileRoute('/_authenticated/transactions')({
  head: () => ({
    meta: [{ title: 'Transações | FinFlow' }],
  }),
  component: TransactionsPage,
})
