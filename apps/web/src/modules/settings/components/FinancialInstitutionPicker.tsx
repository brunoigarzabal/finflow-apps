import { cn } from '@workspace/ui/lib/utils'

import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import {
  FINANCIAL_INSTITUTIONS,
  type FinancialInstitution,
  toInstitutionIcon,
} from '@/config/financialInstitutions'

type Props = {
  value: string
  onChange: (institution: FinancialInstitution) => void
}

export const FinancialInstitutionPicker = ({ value, onChange }: Props) => (
  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
    {FINANCIAL_INSTITUTIONS.map((institution) => {
      const isSelected = value === toInstitutionIcon(institution.id)
      return (
        <button
          key={institution.id}
          type="button"
          onClick={() => onChange(institution)}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-xl p-2 transition-colors',
            isSelected ? 'bg-accent ring-2 ring-primary' : 'hover:bg-muted'
          )}
          title={institution.name}
        >
          <BankAccountIcon
            icon={toInstitutionIcon(institution.id)}
            color={institution.color}
            className="size-12"
          />
          <span className="truncate text-xs font-medium">
            {institution.name}
          </span>
        </button>
      )
    })}
  </div>
)
