import { Skeleton } from '@workspace/ui/components/skeleton'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import {
  useTransactionSummaryByCategory,
  type SummaryByCategoryItem,
} from '@/api/transactions'
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatCurrency'

import { CategoryList } from './CategoryList'

type SectionProps = {
  items: SummaryByCategoryItem[]
  total: number
  label: string
}

const CategorySection = ({ items, total, label }: SectionProps) => {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex flex-1 flex-col">
        <CategoryList items={items} label={label} />
        {items.length > 0 && (
          <div className="flex items-center justify-end gap-2 border-t pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex shrink-0 items-center justify-center md:w-72">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={items}
                dataKey="totalAmount"
                nameKey="categoryName"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                strokeWidth={0}
              >
                {items.map((item) => (
                  <Cell
                    key={item.categoryId}
                    fill={item.categoryColor || FALLBACK_CATEGORY_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  typeof value === 'number' ? formatCurrency(value) : value,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

type Props = {
  startDate: string
  endDate: string
}

export const CategoryBreakdown = ({ startDate, endDate }: Props) => {
  const { data: expenseData, isLoading: expenseLoading } =
    useTransactionSummaryByCategory({ type: 'EXPENSE', startDate, endDate })
  const { data: incomeData, isLoading: incomeLoading } =
    useTransactionSummaryByCategory({ type: 'INCOME', startDate, endDate })

  const isLoading = expenseLoading || incomeLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
            <Skeleton className="mx-auto size-56 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <CategorySection
        items={expenseData?.summaryByCategory ?? []}
        total={expenseData?.total ?? 0}
        label="Despesas"
      />
      <CategorySection
        items={incomeData?.summaryByCategory ?? []}
        total={incomeData?.total ?? 0}
        label="Receitas"
      />
    </div>
  )
}
