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

import type { TransactionFilterValues } from '../transactionQueryParams'

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

type Props = {
  filters: TransactionFilterValues
  onFilterChange: (filters: TransactionFilterValues) => void
  bankAccounts: BankAccount[]
  categories: Category[]
}

export const TransactionFilters = ({
  filters,
  onFilterChange,
  bankAccounts,
  categories,
}: Props) => {
  const update = <K extends keyof TransactionFilterValues>(
    key: K,
    value: TransactionFilterValues[K]
  ) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <Fragment>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.account || 'ALL'}
          onValueChange={(v) => update('account', !v || v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="w-44">
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
          value={filters.category || 'ALL'}
          onValueChange={(v) => update('category', !v || v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="w-44">
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
          onValueChange={(v) => {
            if (v === 'INCOME' || v === 'EXPENSE' || v === 'TRANSFER') {
              update('type', v)
              return
            }

            update('type', '')
          }}
        >
          <SelectTrigger className="w-40">
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
          value={filters.status || 'ALL'}
          onValueChange={(v) => {
            if (v === 'PAID' || v === 'PENDING') {
              update('status', v)
              return
            }

            update('status', '')
          }}
        >
          <SelectTrigger className="w-40">
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
