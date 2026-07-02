import { MoreVerticalIcon, StarIcon } from '@hugeicons/core-free-icons'
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
  onSetDefault: (account: BankAccount) => void
}

export const AccountItem = ({
  account,
  onEdit,
  onAdjustBalance,
  onArchive,
  onSetDefault,
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

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={account.isDefault}
          onClick={() => onSetDefault(account)}
        >
          <HugeiconsIcon
            icon={StarIcon}
            strokeWidth={2}
            className={cn(
              account.isDefault
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            )}
          />
          <span className="sr-only">
            {account.isDefault ? 'Conta padrão' : 'Definir como padrão'}
          </span>
        </Button>

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
            <DropdownMenuItem
              disabled={account.isDefault}
              onClick={() => onArchive(account)}
            >
              Arquivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
