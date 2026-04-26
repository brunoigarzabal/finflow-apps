import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import type { Transaction } from '@/api/transactions'

import { TransactionGroup } from './TransactionGroup'
import type { VirtualOccurrenceAction } from './TransactionItem'

type Props = {
  transactions: Transaction[]
  isLoading: boolean
  onEdit: (transaction: Transaction) => void
  onTogglePaid: (transaction: Transaction) => void
  onVirtualAction: (
    action: VirtualOccurrenceAction,
    transaction: Transaction
  ) => void
}

export const TransactionList = ({
  transactions,
  isLoading,
  onEdit,
  onTogglePaid,
  onVirtualAction,
}: Props) => {
  if (isLoading) {
    return (
      <Fragment>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </Fragment>
    )
  }

  if (transactions.length === 0) {
    return (
      <Fragment>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum lançamento neste mês.
          </p>
        </div>
      </Fragment>
    )
  }

  const grouped = groupByDate(transactions)

  return (
    <Fragment>
      <div className="flex flex-col gap-6">
        {grouped.map(([date, items]) => (
          <TransactionGroup
            key={date}
            date={date}
            transactions={items}
            onEdit={onEdit}
            onTogglePaid={onTogglePaid}
            onVirtualAction={onVirtualAction}
          />
        ))}
      </div>
    </Fragment>
  )
}

const groupByDate = (
  transactions: Transaction[]
): Array<[string, Transaction[]]> => {
  const map = new Map<string, Transaction[]>()

  for (const t of transactions) {
    const date = t.date.slice(0, 10)
    const group = map.get(date)
    if (group) {
      group.push(t)
    } else {
      map.set(date, [t])
    }
  }

  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}
