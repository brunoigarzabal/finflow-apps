import { Label } from '@workspace/ui/components/label'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { addDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ChangeEvent } from 'react'
import { Fragment, useCallback, useMemo, useState } from 'react'
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { BalanceOverTimeGroupBy } from '@/api/transactions'
import { useBalanceOverTime } from '@/api/transactions'
import { formatCurrency, formatNumber } from '@/lib/formatCurrency'

import type { ViewMode } from '../constants'

type ChartRow = {
  date: string
  label: string
  displayDate: string
  income: number
  expense: number
  balance: number
}

type Props = {
  startDate: string
  endDate: string
  viewMode: ViewMode
  periodLabel: string
}

const VIEW_MODE_TO_GROUP_BY: Record<ViewMode, BalanceOverTimeGroupBy> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  accumulated: 'daily',
}

const formatRowLabel = (
  dateStr: string,
  viewMode: ViewMode
): { label: string; displayDate: string } => {
  const parsed = parseISO(dateStr)

  switch (viewMode) {
    case 'weekly': {
      const weekEnd = addDays(parsed, 6)
      const label = `${format(parsed, 'dd/MM', { locale: ptBR })}`
      const displayDate = `${format(parsed, 'dd MMM', { locale: ptBR })} à ${format(weekEnd, 'dd MMM', { locale: ptBR })}`
      return { label, displayDate }
    }
    case 'monthly': {
      const label = format(parsed, 'MMM', { locale: ptBR })
      const displayDate = format(parsed, "MMM 'de' yyyy", { locale: ptBR })
      return { label, displayDate }
    }
    default: {
      const label = format(parsed, 'd', { locale: ptBR })
      const displayDate = format(parsed, 'dd/MM/yyyy', { locale: ptBR })
      return { label, displayDate }
    }
  }
}

const formatSignedResult = (cents: number): string => {
  if (cents > 0) {
    return `+${formatNumber(cents)}`
  }
  return formatNumber(cents)
}

const axisTickCurrency = (cents: number): string => {
  const useCompact = Math.abs(cents) >= 100_000
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    ...(useCompact
      ? { notation: 'compact' as const, maximumFractionDigits: 1 }
      : { maximumFractionDigits: 0 }),
  }).format(cents / 100)
}

type TooltipPayloadItem = {
  payload?: ChartRow
}

type CashflowTooltipProps = {
  active?: boolean
  payload?: readonly TooltipPayloadItem[]
}

const CashflowTooltip = ({ active, payload }: CashflowTooltipProps) => {
  if (!active || !payload?.length) {
    return null
  }
  const row = payload[0]?.payload
  if (!row) {
    return null
  }
  return (
    <div className="shadow-panel rounded-md border border-border bg-card px-3 py-2 text-xs">
      <p className="font-medium text-foreground">{row.displayDate}</p>
      <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
        <li className="flex justify-between gap-6">
          <span>Entradas</span>
          <span className="text-chart-1 tabular-nums">
            {formatCurrency(row.income)}
          </span>
        </li>
        <li className="flex justify-between gap-6">
          <span>Saídas</span>
          <span className="text-destructive tabular-nums">
            {formatCurrency(row.expense)}
          </span>
        </li>
        <li className="flex justify-between gap-6 font-medium text-foreground">
          <span>Saldo</span>
          <span className="text-chart-3 tabular-nums">
            {formatCurrency(row.balance)}
          </span>
        </li>
      </ul>
    </div>
  )
}

export const InflowsOutflowsSection = ({
  startDate,
  endDate,
  viewMode,
  periodLabel,
}: Props) => {
  const [includeUnpaid, setIncludeUnpaid] = useState(true)
  const groupBy = VIEW_MODE_TO_GROUP_BY[viewMode]
  const isAccumulated = viewMode === 'accumulated'

  const { data, isLoading, isError } = useBalanceOverTime({
    startDate,
    endDate,
    includeUnpaid,
    groupBy,
  })

  const handleIncludeUnpaidChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIncludeUnpaid(event.target.checked)
    },
    []
  )

  const rows: ChartRow[] = useMemo(() => {
    const series = data?.balanceOverTime ?? []

    if (isAccumulated) {
      const totals = series.reduce(
        (acc, point) => ({
          income: acc.income + point.income,
          expense: acc.expense + point.expense,
          balance: point.balance,
        }),
        { income: 0, expense: 0, balance: 0 }
      )
      return [
        {
          date: startDate,
          label: periodLabel,
          displayDate: periodLabel,
          income: totals.income,
          expense: totals.expense,
          balance: totals.balance,
        },
      ]
    }

    return series.map((point) => {
      const { label, displayDate } = formatRowLabel(point.date, viewMode)
      return {
        date: point.date,
        label,
        displayDate,
        income: point.income,
        expense: point.expense,
        balance: point.balance,
      }
    })
  }, [data?.balanceOverTime, viewMode, isAccumulated, startDate, periodLabel])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[18.75rem] w-full rounded-lg" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar o relatório. Tente novamente.
      </p>
    )
  }

  return (
    <Fragment>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Label
          htmlFor="reports-include-unpaid"
          className="cursor-pointer gap-2 font-normal text-muted-foreground"
        >
          <input
            id="reports-include-unpaid"
            type="checkbox"
            checked={includeUnpaid}
            onChange={handleIncludeUnpaidChange}
            className="size-4 shrink-0 rounded border border-input accent-primary"
          />
          Considerar movimentações não pagas
        </Label>
        <div className="flex flex-wrap items-center justify-end gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm bg-chart-1"
              aria-hidden
            />
            <span className="text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm bg-destructive"
              aria-hidden
            />
            <span className="text-muted-foreground">Saídas</span>
          </div>
          {!isAccumulated && (
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-4 shrink-0 bg-chart-3"
                aria-hidden
              />
              <span className="text-muted-foreground">Saldo</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[18.75rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 8, right: 4, left: 4, bottom: 4 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickMargin={6}
            />
            <YAxis
              yAxisId="left"
              width={56}
              domain={[0, 'auto']}
              tickFormatter={axisTickCurrency}
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            {!isAccumulated && (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={56}
                tickFormatter={axisTickCurrency}
                tick={{ fontSize: 10 }}
              />
            )}
            <Tooltip content={CashflowTooltip} />
            <Bar
              yAxisId="left"
              dataKey="income"
              name="Entradas"
              fill="var(--color-chart-1)"
              radius={[2, 2, 0, 0]}
              maxBarSize={isAccumulated ? 120 : 14}
            />
            <Bar
              yAxisId="left"
              dataKey="expense"
              name="Saídas"
              fill="var(--color-destructive)"
              radius={[2, 2, 0, 0]}
              maxBarSize={isAccumulated ? 120 : 14}
            />
            {!isAccumulated && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke="var(--color-chart-3)"
                fill="var(--color-chart-3)"
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        {includeUnpaid
          ? 'Valores consideram transações pagas e não pagas, em todas as contas.'
          : 'Valores consideram apenas transações pagas, em todas as contas.'}
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium tabular-nums">Entradas</th>
              <th className="px-3 py-2 font-medium tabular-nums">Saídas</th>
              <th className="px-3 py-2 font-medium tabular-nums">Resultado</th>
              <th className="px-3 py-2 font-medium tabular-nums">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const resultado = row.income - row.expense
              return (
                <tr
                  key={row.date}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2 text-muted-foreground tabular-nums">
                    {row.displayDate}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right tabular-nums',
                      row.income > 0
                        ? 'font-medium text-chart-1'
                        : 'text-muted-foreground/40'
                    )}
                  >
                    {row.income > 0 ? formatNumber(row.income) : '0,00'}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right tabular-nums',
                      row.expense > 0
                        ? 'font-medium text-destructive'
                        : 'text-muted-foreground/40'
                    )}
                  >
                    {row.expense > 0 ? formatNumber(-row.expense) : '0,00'}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right font-medium tabular-nums',
                      resultado > 0 && 'text-chart-1',
                      resultado < 0 && 'text-destructive',
                      resultado === 0 && 'text-muted-foreground/40'
                    )}
                  >
                    {resultado === 0 ? '0,00' : formatSignedResult(resultado)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-chart-1 tabular-nums">
                    {formatNumber(row.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  )
}
