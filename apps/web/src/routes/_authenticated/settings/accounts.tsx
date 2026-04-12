import { createFileRoute } from '@tanstack/react-router'

import { AccountsPage } from '@/modules/settings'

export const Route = createFileRoute('/_authenticated/settings/accounts')({
  component: AccountsPage,
})
