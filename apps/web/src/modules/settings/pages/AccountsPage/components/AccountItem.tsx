import { MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import type { BankAccount } from '@/api/bank-accounts'
import { formatAccountType } from '@/lib/formatAccountType'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'

type Props = {
  account: BankAccount
  onEdit: (account: BankAccount) => void
  onArchive: (account: BankAccount) => void
}

export const AccountItem = ({ account, onEdit, onArchive }: Props) => {
  const icon = getIconByName(account.icon)
  const isNegative = account.currentBalance < 0

  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2">
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-full"
          style={{ backgroundColor: account.color }}
        >
          <HugeiconsIcon
            icon={icon}
            strokeWidth={1.5}
            className="size-5 text-white"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatAccountType(account.type)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn('text-sm font-medium', isNegative && 'text-destructive')}
        >
          {formatCurrency(account.currentBalance)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
            <span className="sr-only">Opções</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive(account)}>
              Arquivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
