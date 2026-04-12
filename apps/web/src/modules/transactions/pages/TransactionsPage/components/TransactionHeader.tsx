import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { addMonths, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Fragment } from 'react'

import type { TransactionType } from '@/api/transactions'

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
}: Props) => {
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: ptBR })

  return (
    <Fragment>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Lançamentos</h1>
          <NewTransactionDropdown onSelect={onNewTransaction} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium capitalize">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </Button>
        </div>
      </div>
    </Fragment>
  )
}
