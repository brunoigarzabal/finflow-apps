import { cn } from '@workspace/ui/lib/utils'

import type { CategoryType } from '@/api/categories'

type Props = {
  value: CategoryType
  onChange: (value: CategoryType) => void
}

const TABS: { value: CategoryType; label: string }[] = [
  { value: 'EXPENSE', label: 'Despesas' },
  { value: 'INCOME', label: 'Receitas' },
]

export const CategoryTabs = ({ value, onChange }: Props) => (
  <div className="flex gap-6 border-b">
    {TABS.map((tab) => {
      const isActive = value === tab.value
      return (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            '-mb-px border-b-2 px-1 py-2 text-sm transition-colors',
            isActive
              ? 'border-primary font-medium text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      )
    })}
  </div>
)
