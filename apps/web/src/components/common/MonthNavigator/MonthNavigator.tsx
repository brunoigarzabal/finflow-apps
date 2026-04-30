import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { addMonths, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Props = {
  currentMonth: Date
  onMonthChange: (month: Date) => void
}

export const MonthNavigator = ({ currentMonth, onMonthChange }: Props) => {
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: ptBR })

  return (
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
      <span className="min-w-[10rem] rounded-full bg-muted px-4 py-1 text-center text-sm font-semibold capitalize">
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
  )
}
