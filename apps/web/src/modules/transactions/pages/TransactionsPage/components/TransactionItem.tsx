import {
  ArrowRight01Icon,
  ArrowUpDownIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'
import type { KeyboardEvent } from 'react'

import type { Transaction } from '@/api/transactions'
import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import { formatCurrency } from '@/lib/formatCurrency'

import { InstallmentBadge } from './InstallmentBadge'
import { RecurringBadge } from './RecurringBadge'

export type VirtualOccurrenceAction = 'mark-as-paid'

type Props = {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onTogglePaid: (transaction: Transaction) => void
  onVirtualAction: (
    action: VirtualOccurrenceAction,
    transaction: Transaction
  ) => void
}

type Account = { id: string; name: string; color: string; icon: string }
type TransferAccounts = {
  originAccount: Account | null
  destinationAccount: Account | null
}

const getAmountPrefix = (transaction: Transaction) => {
  if (transaction.type === 'INCOME') return '+ '
  if (transaction.type === 'EXPENSE') return '- '
  return ''
}

const getTransferAccounts = (transaction: Transaction): TransferAccounts => {
  if (transaction.type !== 'TRANSFER' || !transaction.relatedBankAccount) {
    return { originAccount: null, destinationAccount: null }
  }

  if (transaction.isTransferOut) {
    return {
      originAccount: transaction.bankAccount,
      destinationAccount: transaction.relatedBankAccount,
    }
  }

  return {
    originAccount: transaction.relatedBankAccount,
    destinationAccount: transaction.bankAccount,
  }
}

const getTransactionIcon = (transaction: Transaction, isTransfer: boolean) => {
  if (isTransfer) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
        <HugeiconsIcon
          icon={ArrowUpDownIcon}
          strokeWidth={2}
          className="size-4.5 text-white"
        />
      </span>
    )
  }

  return (
    <BankAccountIcon
      icon={transaction.category?.icon ?? transaction.bankAccount.icon}
      color={transaction.category?.color ?? transaction.bankAccount.color}
      className="size-9 ring-2 ring-background"
      iconClassName="size-4.5"
      strokeWidth={2}
    />
  )
}

const AccountBadge = ({
  account,
  size,
}: {
  account: Account
  size: 'sm' | 'md'
}) => {
  const boxClass = size === 'md' ? 'size-6' : 'size-5'
  const iconClass = size === 'md' ? 'size-3.5' : 'size-3'
  return (
    <BankAccountIcon
      icon={account.icon}
      color={account.color}
      className={boxClass}
      iconClassName={iconClass}
      strokeWidth={2}
      title={account.name}
    />
  )
}

export const TransactionItem = ({
  transaction,
  onEdit,
  onTogglePaid,
  onVirtualAction,
}: Props) => {
  const isTransfer = transaction.type === 'TRANSFER'
  const isVirtual = transaction.isVirtual === true
  const isRecurring = Boolean(transaction.recurringRuleId)
  const isInstallment = Boolean(transaction.installmentGroupId)

  const amountClass = cn(
    'text-sm font-bold whitespace-nowrap tabular-nums',
    transaction.type === 'INCOME' && 'text-emerald-500',
    isTransfer && 'text-blue-500'
  )

  const amountPrefix = getAmountPrefix(transaction)
  const { originAccount, destinationAccount } = getTransferAccounts(transaction)

  const rowClassName = cn(
    'flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50'
  )

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onEdit(transaction)
  }

  const content = (
    <Fragment>
      {getTransactionIcon(transaction, isTransfer)}

      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold">
        <span className="truncate">{transaction.description}</span>
        {isInstallment && (
          <InstallmentBadge
            number={transaction.installmentNumber}
            count={transaction.installmentCount}
          />
        )}
      </span>

      <span className="hidden flex-1 items-center justify-center gap-1.5 sm:flex">
        {isTransfer && originAccount && destinationAccount ? (
          <Fragment>
            <AccountBadge account={originAccount} size="sm" />
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-3.5 text-muted-foreground"
            />
            <AccountBadge account={destinationAccount} size="sm" />
          </Fragment>
        ) : (
          <Fragment>
            {isRecurring && <RecurringBadge />}
            <AccountBadge account={transaction.bankAccount} size="md" />
            <span className="truncate text-xs text-muted-foreground">
              {transaction.bankAccount.name}
            </span>
          </Fragment>
        )}
      </span>

      <span className={amountClass}>
        {amountPrefix}
        {formatCurrency(transaction.amount)}
      </span>

      <button
        type="button"
        className="shrink-0 cursor-pointer p-1"
        onClick={(e) => {
          e.stopPropagation()
          if (isVirtual) {
            onVirtualAction('mark-as-paid', transaction)
            return
          }
          onTogglePaid(transaction)
        }}
        title={transaction.isPaid ? 'Pago' : 'Pendente'}
      >
        <HugeiconsIcon
          icon={transaction.isPaid ? ThumbsUpIcon : ThumbsDownIcon}
          strokeWidth={2}
          className={cn(
            'size-5',
            transaction.isPaid ? 'text-emerald-500' : 'text-muted-foreground'
          )}
        />
      </button>
    </Fragment>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      className={rowClassName}
      onClick={() => onEdit(transaction)}
      onKeyDown={handleRowKeyDown}
    >
      {content}
    </div>
  )
}
