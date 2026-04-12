import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Fragment } from 'react'

import type { Transaction } from '@/api/transactions'

import { TransactionItem } from './TransactionItem'

type Props = {
  date: string
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onTogglePaid: (transaction: Transaction) => void
}

export const TransactionGroup = ({
  date,
  transactions,
  onEdit,
  onTogglePaid,
}: Props) => {
  const formattedDate = format(parseISO(date), "dd 'de' MMMM", {
    locale: ptBR,
  })

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <p className="px-1 text-xs font-medium text-muted-foreground uppercase">
          {formattedDate}
        </p>
        <div className="flex flex-col divide-y divide-border rounded-lg border bg-card">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
              onTogglePaid={onTogglePaid}
            />
          ))}
        </div>
      </div>
    </Fragment>
  )
}
