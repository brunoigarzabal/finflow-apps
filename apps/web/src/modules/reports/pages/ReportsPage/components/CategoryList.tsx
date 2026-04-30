import { HugeiconsIcon } from '@hugeicons/react'

import type { SummaryByCategoryItem } from '@/api/transactions'
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatCurrency'
import { getIconByName } from '@/lib/icons'

type Props = {
  items: SummaryByCategoryItem[]
  label: string
}

export const CategoryList = ({ items, label }: Props) => {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum registro no mês
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.categoryId}
            className="flex items-center gap-3 border-b py-3 last:border-b-0"
          >
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: item.categoryColor || FALLBACK_CATEGORY_COLOR,
              }}
            >
              <HugeiconsIcon
                icon={getIconByName(item.categoryIcon)}
                size={20}
                className="text-white"
              />
            </div>
            <span className="flex-1 text-sm font-medium">
              {item.categoryName}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.totalAmount)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {item.percentageOfTotal.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
