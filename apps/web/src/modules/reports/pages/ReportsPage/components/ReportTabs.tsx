import { cn } from '@workspace/ui/lib/utils'

export type ReportTabId = 'categories' | 'inflows-outflows'

type Props = {
  value: ReportTabId
  onChange: (value: ReportTabId) => void
}

const TABS: { value: ReportTabId; label: string }[] = [
  { value: 'categories', label: 'Categorias' },
  { value: 'inflows-outflows', label: 'Entradas x Saídas' },
]

export const ReportTabs = ({ value, onChange }: Props) => (
  <div className="flex gap-6 border-b border-border">
    {TABS.map((tab) => {
      const isActive = value === tab.value
      return (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            '-mb-px cursor-pointer border-b-2 px-1 py-2 text-sm transition-colors',
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
