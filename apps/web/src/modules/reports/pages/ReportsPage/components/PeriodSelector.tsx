import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'
import {
  addDays,
  addMonths,
  addYears,
  format,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCallback, useState } from 'react'

import { PERIOD_LABELS, type ReportPeriod } from '../constants'

type Props = {
  period: ReportPeriod
  referenceDate: Date
  onPeriodChange: (period: ReportPeriod) => void
  onReferenceDateChange: (date: Date) => void
}

const PERIOD_OPTIONS: ReportPeriod[] = ['today', 'month', 'year']

const getDisplayLabel = (period: ReportPeriod, referenceDate: Date): string => {
  switch (period) {
    case 'today':
      return format(referenceDate, "dd 'de' MMMM yyyy", { locale: ptBR })
    case 'month':
      return format(referenceDate, 'MMMM yyyy', { locale: ptBR })
    case 'year':
      return format(referenceDate, 'yyyy')
  }
}

export const PeriodSelector = ({
  period,
  referenceDate,
  onPeriodChange,
  onReferenceDateChange,
}: Props) => {
  const [open, setOpen] = useState(false)

  const handlePeriodSelect = useCallback(
    (selected: ReportPeriod) => {
      onPeriodChange(selected)
      setOpen(false)
    },
    [onPeriodChange]
  )

  const handlePrevious = () => {
    if (period === 'today') {
      onReferenceDateChange(subDays(referenceDate, 1))
    } else if (period === 'month') {
      onReferenceDateChange(subMonths(referenceDate, 1))
    } else if (period === 'year') {
      onReferenceDateChange(subYears(referenceDate, 1))
    }
  }

  const handleNext = () => {
    if (period === 'today') {
      onReferenceDateChange(addDays(referenceDate, 1))
    } else if (period === 'month') {
      onReferenceDateChange(addMonths(referenceDate, 1))
    } else if (period === 'year') {
      onReferenceDateChange(addYears(referenceDate, 1))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={handlePrevious}>
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          openOnHover
          className="min-w-[10rem] cursor-pointer rounded-full bg-muted px-4 py-1 text-center text-sm font-semibold capitalize hover:bg-muted/80"
        >
          {getDisplayLabel(period, referenceDate)}
        </PopoverTrigger>
        <PopoverContent className="w-auto min-w-[10rem] gap-1 p-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handlePeriodSelect(option)}
              className={cn(
                'w-full rounded-lg px-4 py-2 text-center text-sm transition-colors',
                option === period
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {PERIOD_LABELS[option]}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" onClick={handleNext}>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </Button>
    </div>
  )
}
