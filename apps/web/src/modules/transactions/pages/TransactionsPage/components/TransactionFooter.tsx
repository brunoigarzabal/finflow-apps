import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'

import type { TransactionSummary, TransactionType } from '@/api/transactions'
import { formatCurrency } from '@/lib/formatCurrency'

import { NewTransactionDropdown } from './NewTransactionDropdown'

type Props = {
  summary: TransactionSummary | undefined
  isLoading: boolean
  onNewTransaction: (type: TransactionType) => void
}

export const TransactionFooter = ({
  summary,
  isLoading,
  onNewTransaction,
}: Props) => {
  const balance = summary?.balance ?? 0

  return (
    <Fragment>
      <div className="sticky bottom-0 flex items-center justify-between border-t bg-background px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Saldo</span>
            <span
              className={cn(
                'text-sm font-semibold',
                isLoading
                  ? 'text-muted-foreground'
                  : balance >= 0
                    ? 'text-emerald-500'
                    : 'text-red-500'
              )}
            >
              {isLoading ? '—' : formatCurrency(balance)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Receitas</span>
            <span className="text-sm font-semibold text-emerald-500">
              {isLoading ? '—' : formatCurrency(summary?.totalIncome ?? 0)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Despesas</span>
            <span className="text-sm font-semibold text-red-500">
              {isLoading ? '—' : formatCurrency(summary?.totalExpense ?? 0)}
            </span>
          </div>
        </div>

        <NewTransactionDropdown onSelect={onNewTransaction} />
      </div>
    </Fragment>
  )
}
