import { BankIcon, Tag01Icon, Wallet02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'

import { useBankAccounts } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import { useDashboard } from '@/api/dashboard'
import { HiddenValue } from '@/components/common/HiddenValue'
import { formatCurrency } from '@/lib/formatCurrency'

type StatProps = {
  icon: typeof BankIcon
  label: string
  value: string
  isLoading: boolean
  iconColorClass: string
  iconBgClass: string
  hideable?: boolean
  isNegative?: boolean
}

const StatCard = ({
  icon,
  label,
  value,
  isLoading,
  iconColorClass,
  iconBgClass,
  hideable = false,
  isNegative = false,
}: StatProps) => {
  const renderValue = () => {
    if (isLoading) return <Skeleton className="h-5 w-20" />

    const valueClassName = cn(
      'text-base font-semibold',
      isNegative && 'text-destructive'
    )

    if (hideable) {
      return <HiddenValue value={value} className={valueClassName} />
    }

    return <span className={valueClassName}>{value}</span>
  }

  return (
    <Card size="sm" className="flex-row items-center gap-3 px-4">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          iconBgClass
        )}
      >
        <HugeiconsIcon
          icon={icon}
          strokeWidth={1.8}
          className={cn('size-5', iconColorClass)}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {renderValue()}
      </div>
    </Card>
  )
}

export const ProfileStats = () => {
  const { data: bankAccountsData, isLoading: isLoadingAccounts } =
    useBankAccounts()
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories()
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard()

  const accountsCount = bankAccountsData?.bankAccounts.length ?? 0
  const categoriesCount = categoriesData?.categories.length ?? 0
  const totalBalance = dashboardData?.totalBalance ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={BankIcon}
        label="Contas cadastradas"
        value={String(accountsCount)}
        isLoading={isLoadingAccounts}
        iconColorClass="text-primary"
        iconBgClass="bg-primary/10"
      />
      <StatCard
        icon={Tag01Icon}
        label="Categorias"
        value={String(categoriesCount)}
        isLoading={isLoadingCategories}
        iconColorClass="text-blue-600 dark:text-blue-400"
        iconBgClass="bg-blue-500/10 dark:bg-blue-500/15"
      />
      <StatCard
        icon={Wallet02Icon}
        label="Saldo total"
        value={formatCurrency(totalBalance)}
        isLoading={isLoadingDashboard}
        iconColorClass="text-green-600 dark:text-green-400"
        iconBgClass="bg-green-500/10 dark:bg-green-500/15"
        hideable
        isNegative={totalBalance < 0}
      />
    </div>
  )
}
