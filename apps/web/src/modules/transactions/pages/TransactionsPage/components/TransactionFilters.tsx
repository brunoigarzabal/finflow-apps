import { HugeiconsIcon } from '@hugeicons/react'
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@workspace/ui/components/combobox'
import { Fragment, useMemo } from 'react'

import type { BankAccount } from '@/api/bank-accounts'
import type { Category } from '@/api/categories'
import { BankAccountIcon } from '@/components/common/BankAccountIcon'
import { getIconByName } from '@/lib/icons'

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

type ComboboxOption = { value: string; label: string }
type ComboboxIconOption = ComboboxOption & { icon: string; color: string }

const ALL_ACCOUNTS_ITEM: ComboboxIconOption = {
  value: 'ALL',
  label: 'Todas as contas',
  icon: '',
  color: '',
}

const ALL_CATEGORIES_ITEM: ComboboxIconOption = {
  value: 'ALL',
  label: 'Todas as categorias',
  icon: '',
  color: '',
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

  const accountItems = useMemo<ComboboxIconOption[]>(
    () => [
      ALL_ACCOUNTS_ITEM,
      ...bankAccounts.map((a) => ({
        value: a.id,
        label: a.name,
        icon: a.icon,
        color: a.color,
      })),
    ],
    [bankAccounts]
  )

  const categoryItems = useMemo<ComboboxIconOption[]>(
    () => [
      ALL_CATEGORIES_ITEM,
      ...categories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
        color: c.color,
      })),
    ],
    [categories]
  )

  const selectedAccount =
    accountItems.find((i) => i.value === (filters.account || 'ALL')) ?? null
  const selectedCategory =
    categoryItems.find((i) => i.value === (filters.category || 'ALL')) ?? null
  const selectedType =
    TYPE_OPTIONS.find((o) => o.value === (filters.type || 'ALL')) ?? null
  const selectedStatus =
    STATUS_OPTIONS.find((o) => o.value === (filters.status || 'ALL')) ?? null

  return (
    <Fragment>
      <div className="flex flex-wrap items-center gap-2">
        <Combobox
          value={selectedAccount}
          onValueChange={(item) => {
            const v = (item as ComboboxIconOption | null)?.value ?? 'ALL'
            update('account', v === 'ALL' ? '' : v)
          }}
          items={accountItems}
        >
          <div className="relative w-44">
            <ComboboxTrigger
              className={filters.account ? 'w-full pr-14' : 'w-full'}
            >
              {selectedAccount?.icon && (
                <BankAccountIcon
                  icon={selectedAccount.icon}
                  color={selectedAccount.color}
                  className="size-4"
                  iconClassName="size-2.5"
                />
              )}
              <ComboboxValue placeholder="Todas as contas" />
            </ComboboxTrigger>
            {filters.account && (
              <ComboboxClear
                aria-label="Limpar filtro de conta"
                className="absolute top-1/2 right-7 -translate-y-1/2"
              />
            )}
          </div>
          <ComboboxContent className="min-w-56">
            <ComboboxInput placeholder="Buscar conta..." />
            <ComboboxEmpty>Nenhuma conta encontrada.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const opt = item as ComboboxIconOption
                return (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.icon && (
                      <BankAccountIcon
                        icon={opt.icon}
                        color={opt.color}
                        className="size-4"
                        iconClassName="size-2.5"
                      />
                    )}
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Combobox
          value={selectedCategory}
          onValueChange={(item) => {
            const v = (item as ComboboxIconOption | null)?.value ?? 'ALL'
            update('category', v === 'ALL' ? '' : v)
          }}
          items={categoryItems}
        >
          <div className="relative w-44">
            <ComboboxTrigger
              className={filters.category ? 'w-full pr-14' : 'w-full'}
            >
              {selectedCategory?.icon && (
                <span
                  className="flex size-4.5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  <HugeiconsIcon
                    icon={getIconByName(selectedCategory.icon)}
                    strokeWidth={1.5}
                    className="size-2.5 text-white"
                  />
                </span>
              )}
              <ComboboxValue placeholder="Todas as categorias" />
            </ComboboxTrigger>
            {filters.category && (
              <ComboboxClear
                aria-label="Limpar filtro de categoria"
                className="absolute top-1/2 right-7 -translate-y-1/2"
              />
            )}
          </div>
          <ComboboxContent className="min-w-56">
            <ComboboxInput placeholder="Buscar categoria..." />
            <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const opt = item as ComboboxIconOption
                return (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.icon && (
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: opt.color }}
                      >
                        <HugeiconsIcon
                          icon={getIconByName(opt.icon)}
                          strokeWidth={1.5}
                          className="size-2.5 text-white"
                        />
                      </span>
                    )}
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Combobox
          value={selectedType}
          onValueChange={(item) => {
            const v = (item as ComboboxOption | null)?.value ?? 'ALL'
            if (v === 'INCOME' || v === 'EXPENSE' || v === 'TRANSFER') {
              update('type', v)
              return
            }
            update('type', '')
          }}
          items={TYPE_OPTIONS}
        >
          <div className="relative w-40">
            <ComboboxTrigger
              className={filters.type ? 'w-full pr-14' : 'w-full'}
            >
              <ComboboxValue placeholder="Todos os tipos" />
            </ComboboxTrigger>
            {filters.type && (
              <ComboboxClear
                aria-label="Limpar filtro de tipo"
                className="absolute top-1/2 right-7 -translate-y-1/2"
              />
            )}
          </div>
          <ComboboxContent className="min-w-48">
            <ComboboxInput placeholder="Buscar..." />
            <ComboboxEmpty>Nenhuma opção encontrada.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const opt = item as ComboboxOption
                return (
                  <ComboboxItem key={opt.value} value={opt}>
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Combobox
          value={selectedStatus}
          onValueChange={(item) => {
            const v = (item as ComboboxOption | null)?.value ?? 'ALL'
            if (v === 'PAID' || v === 'PENDING') {
              update('status', v)
              return
            }
            update('status', '')
          }}
          items={STATUS_OPTIONS}
        >
          <div className="relative w-40">
            <ComboboxTrigger
              className={filters.status ? 'w-full pr-14' : 'w-full'}
            >
              <ComboboxValue placeholder="Todos os status" />
            </ComboboxTrigger>
            {filters.status && (
              <ComboboxClear
                aria-label="Limpar filtro de status"
                className="absolute top-1/2 right-7 -translate-y-1/2"
              />
            )}
          </div>
          <ComboboxContent className="min-w-48">
            <ComboboxInput placeholder="Buscar..." />
            <ComboboxEmpty>Nenhuma opção encontrada.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const opt = item as ComboboxOption
                return (
                  <ComboboxItem key={opt.value} value={opt}>
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </Fragment>
  )
}
