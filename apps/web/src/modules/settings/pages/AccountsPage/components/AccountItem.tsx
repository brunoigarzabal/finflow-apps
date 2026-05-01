import { MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'

import type { BankAccount } from '@/api/bank-accounts'
import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import { formatAccountType } from '@/lib/formatAccountType'
import { formatCurrency } from '@/lib/formatCurrency'

type Props = {
  account: BankAccount
  onEdit: (account: BankAccount) => void
  onAdjustBalance: (account: BankAccount) => void
  onArchive: (account: BankAccount) => void
}

export const AccountItem = ({
  account,
  onEdit,
  onAdjustBalance,
  onArchive,
}: Props) => {
  const isNegative = account.currentBalance < 0

  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2">
      <div className="flex items-center gap-3">
        <BankAccountIcon
          icon={account.icon}
          color={account.color}
          className="size-10"
          iconClassName="size-5"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatAccountType(account.type)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium',
            isNegative && 'text-destructive'
          )}
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
            <DropdownMenuItem onClick={() => onAdjustBalance(account)}>
              Ajustar saldo
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
