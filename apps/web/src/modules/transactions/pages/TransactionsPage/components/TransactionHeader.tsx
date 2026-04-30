import type { TransactionType } from '@/api/transactions'
import { MonthNavigator } from '@/components/common/MonthNavigator'

import { NewTransactionDropdown } from './NewTransactionDropdown'

type Props = {
  currentMonth: Date
  onMonthChange: (month: Date) => void
  onNewTransaction: (type: TransactionType) => void
}

export const TransactionHeader = ({
  currentMonth,
  onMonthChange,
  onNewTransaction,
}: Props) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h1 className="hidden text-2xl font-bold sm:block">Lançamentos</h1>
      <NewTransactionDropdown onSelect={onNewTransaction} />
    </div>

    <MonthNavigator currentMonth={currentMonth} onMonthChange={onMonthChange} />
  </div>
)
