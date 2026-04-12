import { Fragment } from 'react'

import { BalanceCard } from './components/BalanceCard'
import { DashboardGreeting } from './components/DashboardGreeting'
import { PendingTransactionsCard } from './components/PendingTransactionsCard'
import { QuickActions } from './components/QuickActions'
import { TopExpensesCard } from './components/TopExpensesCard'

export const DashboardPage = () => (
  <Fragment>
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <DashboardGreeting />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BalanceCard />
        <TopExpensesCard />
        <PendingTransactionsCard type="EXPENSE" />
        <PendingTransactionsCard type="INCOME" />
      </div>
    </div>
  </Fragment>
)
