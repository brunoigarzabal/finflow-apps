import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Fragment } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useTransactionSummaryByCategory } from '@/api/transactions'
import { currentMonthRange } from '@/lib/dates'
import { usePrivacyStore } from '@/store'

const GRAY_COLOR = '#94a3b8'
const TOP_COUNT = 5

export const TopExpensesCard = () => {
  const { startDate, endDate } = currentMonthRange()
  const { data, isLoading } = useTransactionSummaryByCategory({
    type: 'EXPENSE',
    startDate,
    endDate,
  })
  const isHidden = usePrivacyStore((s) => s.isHidden)

  const items = (data?.items ?? []).slice(0, TOP_COUNT)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Maiores despesas
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Fragment>
            <Skeleton className="mx-auto h-40 w-40 rounded-full" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </Fragment>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum gasto registrado no mês
          </p>
        ) : (
          <Fragment>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={items}
                  dataKey="total"
                  nameKey="categoryName"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {items.map((item, index) => (
                    <Cell
                      key={item.categoryId ?? index}
                      fill={
                        isHidden
                          ? GRAY_COLOR
                          : (item.categoryColor ?? GRAY_COLOR)
                      }
                    />
                  ))}
                </Pie>
                {!isHidden && (
                  <Tooltip
                    formatter={(value) => [
                      typeof value === 'number'
                        ? `${(value / 100).toFixed(2)} BRL`
                        : value,
                      '',
                    ]}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div
                  key={item.categoryId ?? index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: isHidden
                          ? GRAY_COLOR
                          : (item.categoryColor ?? GRAY_COLOR),
                      }}
                    />
                    <span className="text-sm">
                      {item.categoryName ?? 'Sem categoria'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Fragment>
        )}
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
