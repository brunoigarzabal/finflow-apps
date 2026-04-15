import { Fragment, useState } from 'react'

import { useBankAccounts } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import type { TransactionType } from '@/api/transactions'
import { TransactionFormDialog } from '@/modules/transactions'

import { BalanceCard } from './components/BalanceCard'
import { DashboardGreeting } from './components/DashboardGreeting'
import { PendingTransactionsCard } from './components/PendingTransactionsCard'
import { QuickActions } from './components/QuickActions'
import { TopExpensesCard } from './components/TopExpensesCard'

export const DashboardPage = () => {
  const [formDialogType, setFormDialogType] = useState<TransactionType | null>(
    null
  )

  const { data: bankAccountsData } = useBankAccounts()
  const { data: categoriesData } = useCategories()

  const bankAccounts = bankAccountsData?.bankAccounts ?? []
  const categories = categoriesData?.categories ?? []

  return (
    <Fragment>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <DashboardGreeting />
          <QuickActions onAction={setFormDialogType} />
        </div>

        <BalanceCard />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <TopExpensesCard />
          <PendingTransactionsCard type="EXPENSE" />
          <PendingTransactionsCard type="INCOME" />
        </div>
      </div>

      <TransactionFormDialog
        open={formDialogType !== null}
        onOpenChange={(open) => {
          if (!open) setFormDialogType(null)
        }}
        type={formDialogType ?? 'EXPENSE'}
        bankAccounts={bankAccounts}
        categories={categories}
      />
    </Fragment>
  )
}
