import { createFileRoute } from '@tanstack/react-router'

import { ReportsPage } from '@/modules/reports'

export const Route = createFileRoute('/_authenticated/reports')({
  head: () => ({
    meta: [{ title: 'Relatórios | Minhas Finanças' }],
  }),
  component: ReportsPage,
})
