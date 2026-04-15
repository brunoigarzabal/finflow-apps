import {
  Add01Icon,
  ArrowDataTransferHorizontalIcon,
  MinusSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'

type Action = {
  label: string
  icon: Parameters<typeof HugeiconsIcon>[0]['icon']
  colorClass: string
  bgClass: string
  href: string
}

const ACTIONS: Action[] = [
  {
    label: 'Despesa',
    icon: MinusSignIcon,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    href: '/transactions',
  },
  {
    label: 'Receita',
    icon: Add01Icon,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    href: '/transactions',
  },
  {
    label: 'Transferência',
    icon: ArrowDataTransferHorizontalIcon,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    href: '/transactions',
  },
]

export const QuickActions = () => (
  <Fragment>
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted-foreground">
        Ações rápidas
      </span>
      <div className="flex gap-3">
        {ACTIONS.map(({ label, icon, colorClass, bgClass, href }) => (
          <Link key={label} to={href}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-full',
                  bgClass
                )}
              >
                <HugeiconsIcon
                  icon={icon}
                  strokeWidth={2}
                  className={cn('size-5', colorClass)}
                />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </Fragment>
)
