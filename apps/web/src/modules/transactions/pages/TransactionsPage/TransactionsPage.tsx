import { endOfMonth, format, startOfMonth } from 'date-fns'
import { Fragment, useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useBankAccounts } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import {
  useTransactions,
  useTransactionSummary,
  useUpdateTransaction,
} from '@/api/transactions'
import type { Transaction, TransactionType } from '@/api/transactions'

import { DeleteTransactionDialog } from './components/DeleteTransactionDialog'
import {
  TransactionFilters,
  type FilterValues,
} from './components/TransactionFilters'
import { TransactionFooter } from './components/TransactionFooter'
import { TransactionFormDialog } from '@/modules/transactions/components/TransactionFormDialog'
import { TransactionHeader } from './components/TransactionHeader'
import { TransactionList } from './components/TransactionList'

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  type: '',
  isPaid: '',
  bankAccountId: '',
  categoryId: '',
}

export const TransactionsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formDialogType, setFormDialogType] =
    useState<TransactionType>('EXPENSE')
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const [deleteTransaction, setDeleteTransaction] =
    useState<Transaction | null>(null)

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const queryParams = {
    startDate,
    endDate,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.isPaid === 'PAID'
      ? { isPaid: true }
      : filters.isPaid === 'PENDING'
        ? { isPaid: false }
        : {}),
    ...(filters.bankAccountId ? { bankAccountId: filters.bankAccountId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  }

  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useTransactions(queryParams)
  const { data: summaryData, isLoading: isLoadingSummary } =
    useTransactionSummary({
      startDate,
      endDate,
      bankAccountId: filters.bankAccountId || undefined,
    })
  const { data: bankAccountsData } = useBankAccounts()
  const { data: categoriesData } = useCategories()

  const updateMutation = useUpdateTransaction()

  const bankAccounts = bankAccountsData?.bankAccounts ?? []
  const categories = categoriesData?.categories ?? []
  const transactions = transactionsData?.transactions ?? []

  const handleNewTransaction = useCallback((type: TransactionType) => {
    setEditingTransaction(null)
    setFormDialogType(type)
    setFormDialogOpen(true)
  }, [])

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormDialogType(transaction.type)
    setFormDialogOpen(true)
  }, [])

  const handleTogglePaid = useCallback(
    (transaction: Transaction) => {
      updateMutation.mutate(
        { id: transaction.id, body: { isPaid: !transaction.isPaid } },
        {
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : 'Erro ao atualizar status'
            )
          },
        }
      )
    },
    [updateMutation]
  )

  const handleDeleteFromForm = useCallback((transaction: Transaction) => {
    setFormDialogOpen(false)
    setDeleteTransaction(transaction)
  }, [])

  return (
    <Fragment>
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
          <TransactionHeader
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onNewTransaction={handleNewTransaction}
          />

          <TransactionFilters
            filters={filters}
            onFilterChange={setFilters}
            bankAccounts={bankAccounts}
            categories={categories}
          />

          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
            search={filters.search}
            onEdit={handleEdit}
            onTogglePaid={handleTogglePaid}
          />
        </div>

        <TransactionFooter
          summary={summaryData}
          isLoading={isLoadingSummary}
        />
      </div>

      <TransactionFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        type={formDialogType}
        transaction={editingTransaction}
        bankAccounts={bankAccounts}
        categories={categories}
        onDelete={handleDeleteFromForm}
      />

      <DeleteTransactionDialog
        transaction={deleteTransaction}
        open={!!deleteTransaction}
        onOpenChange={(open) => {
          if (!open) setDeleteTransaction(null)
        }}
      />
    </Fragment>
  )
}
