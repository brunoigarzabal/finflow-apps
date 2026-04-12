import { createFileRoute } from '@tanstack/react-router'

import { TransactionsPage } from '@/modules/transactions'

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsPage,
})
