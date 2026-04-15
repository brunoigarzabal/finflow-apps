import { ThumbsDownIcon, ThumbsUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'

import type { Transaction } from '@/api/transactions'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'

type Props = {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onTogglePaid: (transaction: Transaction) => void
}

export const TransactionItem = ({
  transaction,
  onEdit,
  onTogglePaid,
}: Props) => {
  const amountClass = cn(
    'text-sm font-bold whitespace-nowrap tabular-nums',
    transaction.type === 'INCOME' && 'text-emerald-500',
    transaction.type === 'TRANSFER' && 'text-blue-500'
  )

  const amountPrefix =
    transaction.type === 'INCOME'
      ? '+ '
      : transaction.type === 'EXPENSE'
        ? '- '
        : ''

  const categoryIcon = getIconByName(transaction.category.icon)
  const bankAccountIcon = getIconByName(transaction.bankAccount.icon)

  return (
    <Fragment>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
        onClick={() => onEdit(transaction)}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full ring-2 ring-background"
          style={{ backgroundColor: transaction.category.color }}
        >
          <HugeiconsIcon
            icon={categoryIcon}
            strokeWidth={2}
            className="size-4.5 text-white"
          />
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {transaction.description}
        </span>

        <span className="hidden flex-1 items-center justify-center gap-1.5 sm:flex">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: transaction.bankAccount.color }}
          >
            <HugeiconsIcon
              icon={bankAccountIcon}
              strokeWidth={2}
              className="size-3.5 text-white"
            />
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {transaction.bankAccount.name}
          </span>
        </span>

        <span className={amountClass}>
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </span>

        <button
          type="button"
          className="shrink-0 cursor-pointer p-1"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePaid(transaction)
          }}
          title={transaction.isPaid ? 'Pago' : 'Pendente'}
        >
          <HugeiconsIcon
            icon={transaction.isPaid ? ThumbsUpIcon : ThumbsDownIcon}
            strokeWidth={2}
            className={cn(
              'size-5',
              transaction.isPaid ? 'text-emerald-500' : 'text-muted-foreground'
            )}
          />
        </button>
      </button>
    </Fragment>
  )
}
