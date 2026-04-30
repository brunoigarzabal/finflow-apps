import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useMemo, type ReactNode } from 'react'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useTransactionSummaryByCategory } from '@/api/transactions'
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants'
import { currentMonthRange } from '@/lib/dates'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'
import { usePrivacyStore } from '@/store'

const TOP_COUNT = 5

export const TopExpensesCard = () => {
  const { startDate, endDate } = currentMonthRange()
  const { data, isLoading } = useTransactionSummaryByCategory({
    type: 'EXPENSE',
    startDate,
    endDate,
    isPaid: 'true',
  })
  const isHidden = usePrivacyStore((s) => s.isHidden)

  const items = (data?.summaryByCategory ?? []).slice(0, TOP_COUNT)

  const pieChartData = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        fill: isHidden ? FALLBACK_CATEGORY_COLOR : item.categoryColor,
      })),
    [items, isHidden]
  )

  let cardBodyContent: ReactNode
  if (isLoading) {
    cardBodyContent = (
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex flex-1 flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <Skeleton className="mx-auto h-[9.375rem] w-[9.375rem] rounded-full" />
      </div>
    )
  } else if (items.length === 0) {
    cardBodyContent = (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum gasto registrado no mês
      </p>
    )
  } else {
    cardBodyContent = (
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="flex flex-1 flex-col gap-3">
          {items.map((item) => (
            <div key={item.categoryId} className="flex items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isHidden
                    ? FALLBACK_CATEGORY_COLOR
                    : item.categoryColor,
                }}
              >
                <HugeiconsIcon
                  icon={getIconByName(item.categoryIcon)}
                  size={16}
                  className="text-white"
                />
              </div>
              <span className="flex-1 text-sm font-medium">
                {item.categoryName}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {item.percentageOfTotal.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="totalAmount"
                nameKey="categoryName"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={3}
                strokeWidth={0}
              />
              {!isHidden && (
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === 'number' ? formatCurrency(value) : value,
                    name,
                  ]}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Maiores gastos do mês atual
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {cardBodyContent}
      </CardContent>

      <CardFooter>
        <Link
          to="/reports"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Ver relatório
        </Link>
      </CardFooter>
    </Card>
  )
}
