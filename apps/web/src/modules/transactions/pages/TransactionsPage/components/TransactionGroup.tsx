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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1">
          <p className="whitespace-nowrap text-xs font-semibold text-muted-foreground uppercase">
            {formattedDate}
          </p>
          <hr className="flex-1 border-border" />
        </div>
        <div className="flex flex-col divide-y divide-border rounded-xl border bg-card">
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
