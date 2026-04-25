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

const formatCurrentDate = () =>
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

const STATS = [
  {
    label: 'Receitas no mês atual',
    key: 'totalIncome' as const,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-500/10 dark:bg-green-500/15',
  },
  {
    label: 'Despesas no mês atual',
    key: 'totalExpense' as const,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/10 dark:bg-red-500/15',
  },
]

export const DashboardGreeting = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
  const { data: profileData } = useProfile()

  const firstName = profileData?.user.name.split(' ')[0]

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground capitalize">
          {formatCurrentDate()}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo das suas finanças este mês.
        </p>
      </div>

      <div className="mt-2 flex gap-3">
        {STATS.map(({ label, key, colorClass, bgClass }) => (
          <div
            key={label}
            className={cn(
              'flex flex-col gap-0.5 rounded-2xl px-4 py-2.5',
              bgClass
            )}
          >
            <span className="text-xs text-muted-foreground">{label}</span>
            {isDashboardLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <HiddenValue
                value={formatCurrency(dashboardData?.summary[key] ?? 0)}
                className={cn('text-sm font-semibold', colorClass)}
              />
            )}
          </div>
        ))}
      </div>
    </Fragment>
  )
}
