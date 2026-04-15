import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment, useState } from 'react'

import type { TransactionSummary } from '@/api/transactions'
import { formatCurrency } from '@/lib/formatCurrency'

type Props = {
  summary: TransactionSummary | undefined
  isLoading: boolean
}

type StatRowProps = {
  label: string
  value: number
  isLoading: boolean
  valueClass?: string
}

const StatRow = ({ label, value, isLoading, valueClass }: StatRowProps) => (
  <div className="flex items-center justify-between gap-12">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn('text-sm tabular-nums', valueClass)}>
      {isLoading ? '—' : formatCurrency(value)}
    </span>
  </div>
)

export const TransactionFooter = ({ summary, isLoading }: Props) => {
  const [expanded, setExpanded] = useState(false)

  const balance = summary?.balance ?? 0
  const pendingIncome = summary?.pendingIncome ?? 0
  const pendingExpense = summary?.pendingExpense ?? 0
  const projected = balance + (pendingIncome - pendingExpense)

  return (
    <Fragment>
      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <div className="flex flex-col gap-1.5">
          {expanded && (
            <Fragment>
              <StatRow
                label="saldo anterior"
                value={summary?.previousBalance ?? 0}
                isLoading={isLoading}
              />

              <div className="my-1 h-px bg-border" />

              <StatRow
                label="receita realizada"
                value={summary?.totalIncome ?? 0}
                isLoading={isLoading}
                valueClass="text-emerald-500 font-medium"
              />
              <StatRow
                label="receita prevista"
                value={(summary?.totalIncome ?? 0) + pendingIncome}
                isLoading={isLoading}
              />
              <StatRow
                label="despesa realizada"
                value={-(summary?.totalExpense ?? 0)}
                isLoading={isLoading}
                valueClass="text-red-500 font-medium"
              />
              <StatRow
                label="despesa prevista"
                value={-((summary?.totalExpense ?? 0) + pendingExpense)}
                isLoading={isLoading}
              />

              <div className="my-1 h-px bg-border" />
            </Fragment>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <StatRow
                label="saldo"
                value={balance}
                isLoading={isLoading}
                valueClass={cn(
                  'font-bold text-base',
                  !isLoading && (balance >= 0 ? 'text-emerald-500' : 'text-red-500')
                )}
              />
              <StatRow
                label="previsto"
                value={projected}
                isLoading={isLoading}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            >
              <HugeiconsIcon
                icon={expanded ? ArrowDown01Icon : ArrowUp01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
