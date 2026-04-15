import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Fragment } from 'react'

import type { BankAccount } from '@/api/bank-accounts'
import type { Category } from '@/api/categories'
import type { TransactionType } from '@/api/transactions'

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
  { value: 'TRANSFER', label: 'Transferências' },
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'PENDING', label: 'Pendentes' },
]

export type FilterValues = {
  search: string
  type: TransactionType | ''
  isPaid: 'PAID' | 'PENDING' | ''
  bankAccountId: string
  categoryId: string
}

type Props = {
  filters: FilterValues
  onFilterChange: (filters: FilterValues) => void
  bankAccounts: BankAccount[]
  categories: Category[]
}

export const TransactionFilters = ({
  filters,
  onFilterChange,
  bankAccounts,
  categories,
}: Props) => {
  const update = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <Fragment>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="max-w-[14rem]"
        />

        <Select
          value={filters.bankAccountId || 'ALL'}
          onValueChange={(v) => update('bankAccountId', v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="w-[11rem]">
            <SelectValue placeholder="Todas as contas">
              {(value) =>
                value === 'ALL'
                  ? 'Todas as contas'
                  : (bankAccounts.find((a) => a.id === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as contas</SelectItem>
            {bankAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || 'ALL'}
          onValueChange={(v) => update('categoryId', v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="w-[11rem]">
            <SelectValue placeholder="Todas as categorias">
              {(value) =>
                value === 'ALL'
                  ? 'Todas as categorias'
                  : (categories.find((c) => c.id === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type || 'ALL'}
          onValueChange={(v) =>
            update('type', v === 'ALL' ? '' : (v as TransactionType))
          }
        >
          <SelectTrigger className="w-[10rem]">
            <SelectValue placeholder="Todos os tipos">
              {(value) =>
                TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.isPaid || 'ALL'}
          onValueChange={(v) =>
            update('isPaid', v === 'ALL' ? '' : (v as 'PAID' | 'PENDING'))
          }
        >
          <SelectTrigger className="w-[10rem]">
            <SelectValue placeholder="Todos os status">
              {(value) =>
                STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Fragment>
  )
}
