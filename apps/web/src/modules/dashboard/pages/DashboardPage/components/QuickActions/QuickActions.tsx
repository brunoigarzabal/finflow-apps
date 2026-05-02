import {
  Add01Icon,
  ArrowDataTransferHorizontalIcon,
  MinusSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'

import type { TransactionType } from '@/api/transactions'

type Action = {
  label: string
  type: TransactionType
  icon: Parameters<typeof HugeiconsIcon>[0]['icon']
  colorClass: string
  bgClass: string
}

const ACTIONS: Action[] = [
  {
    label: 'Despesa',
    type: 'EXPENSE',
    icon: MinusSignIcon,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass:
      'bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/15 dark:hover:bg-red-500/25',
  },
  {
    label: 'Receita',
    type: 'INCOME',
    icon: Add01Icon,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass:
      'bg-green-500/10 hover:bg-green-500/20 dark:bg-green-500/15 dark:hover:bg-green-500/25',
  },
  {
    label: 'Transferência',
    type: 'TRANSFER',
    icon: ArrowDataTransferHorizontalIcon,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass:
      'bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/15 dark:hover:bg-blue-500/25',
  },
]

type Props = {
  onAction: (type: TransactionType) => void
}

export const QuickActions = ({ onAction }: Props) => (
  <Fragment>
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Ações rápidas
      </span>
      <div className="grid grid-cols-2 gap-2 md:flex">
        {ACTIONS.map(({ label, type, icon, colorClass, bgClass }) => (
          <button
            key={label}
            type="button"
            onClick={() => onAction(type)}
            className={cn(
              'flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 transition-all active:scale-95',
              'last:col-span-2 last:md:col-span-1',
              bgClass
            )}
          >
            <HugeiconsIcon
              icon={icon}
              strokeWidth={2}
              className={cn('size-4', colorClass)}
            />
            <span className={cn('text-sm font-medium', colorClass)}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  </Fragment>
)
