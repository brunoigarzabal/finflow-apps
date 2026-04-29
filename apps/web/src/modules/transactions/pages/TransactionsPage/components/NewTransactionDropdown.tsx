import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Fragment } from 'react'

import type { TransactionType } from '@/api/transactions'

const OPTIONS: Array<{ type: TransactionType; label: string; color: string }> =
  [
    { type: 'EXPENSE', label: 'Nova despesa', color: 'bg-red-500' },
    { type: 'INCOME', label: 'Nova receita', color: 'bg-emerald-500' },
    { type: 'TRANSFER', label: 'Nova transferência', color: 'bg-blue-500' },
  ]

type Props = {
  onSelect: (type: TransactionType) => void
}

export const NewTransactionDropdown = ({ onSelect }: Props) => (
  <Fragment>
    <DropdownMenu>
      <DropdownMenuTrigger
        openOnHover
        aria-haspopup="menu"
        render={
          <button className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground" />
        }
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4}>
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => onSelect(option.type)}
          >
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${option.color}`} />
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </Fragment>
)
