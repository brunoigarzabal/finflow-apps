import { CheckmarkCircle02Icon, Clock01Icon } from '@hugeicons/core-free-icons'
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
    'text-sm font-semibold whitespace-nowrap',
    transaction.type === 'INCOME' && 'text-emerald-500',
    transaction.type === 'TRANSFER' && 'text-blue-500'
  )

  const amountPrefix =
    transaction.type === 'INCOME'
      ? '+ '
      : transaction.type === 'EXPENSE'
        ? '- '
        : ''

  const categoryIcon = transaction.categoryIcon
    ? getIconByName(transaction.categoryIcon)
    : null

  return (
    <Fragment>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        onClick={() => onEdit(transaction)}
      >
        {categoryIcon && (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: transaction.categoryColor ?? '#6366f1' }}
          >
            <HugeiconsIcon
              icon={categoryIcon}
              strokeWidth={2}
              className="size-4 text-white"
            />
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">
            {transaction.description}
          </span>
          {transaction.categoryName && (
            <span className="truncate text-xs text-muted-foreground">
              {transaction.categoryName}
            </span>
          )}
        </div>

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
            icon={transaction.isPaid ? CheckmarkCircle02Icon : Clock01Icon}
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
