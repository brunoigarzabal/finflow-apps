import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'

import type { Transaction } from '@/api/transactions'

import { TransactionGroup } from './TransactionGroup'

type Props = {
  transactions: Transaction[]
  isLoading: boolean
  search: string
  onEdit: (transaction: Transaction) => void
  onTogglePaid: (transaction: Transaction) => void
}

export const TransactionList = ({
  transactions,
  isLoading,
  search,
  onEdit,
  onTogglePaid,
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

  const filtered = search
    ? transactions.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : transactions

  if (filtered.length === 0) {
    return (
      <Fragment>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {search
              ? 'Nenhum lançamento encontrado para esta busca.'
              : 'Nenhum lançamento neste mês.'}
          </p>
        </div>
      </Fragment>
    )
  }

  const grouped = groupByDate(filtered)

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

  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}
