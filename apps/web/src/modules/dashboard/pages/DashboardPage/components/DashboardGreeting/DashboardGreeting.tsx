import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment } from 'react'

import { useProfile } from '@/api/auth'
import { useDashboard } from '@/api/dashboard'
import { formatCurrency } from '@/lib/formatCurrency'

import { HiddenValue } from '../HiddenValue'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const DashboardGreeting = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
  const { data: profileData } = useProfile()

  const firstName = profileData?.user.name.split(' ')[0]

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo das suas finanças este mês.
        </p>
      </div>

      <div className="mt-2 flex gap-6">
        {[
          {
            label: 'Receitas',
            value: dashboardData?.summary.totalIncome ?? 0,
            colorClass: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Despesas',
            value: dashboardData?.summary.totalExpense ?? 0,
            colorClass: 'text-red-600 dark:text-red-400',
          },
        ].map(({ label, value, colorClass }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            {isDashboardLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <HiddenValue
                value={formatCurrency(value)}
                className={cn('text-sm font-semibold', colorClass)}
              />
            )}
          </div>
        ))}
      </div>
    </Fragment>
  )
}
