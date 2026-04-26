import { endOfMonth, format, startOfMonth } from 'date-fns'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useBankAccounts } from '@/api/bank-accounts'
import { useCategories } from '@/api/categories'
import {
  useCancelRecurringOccurrence,
  useDeleteRecurringRule,
  useRecurringRules,
  useUpdateRecurringRule,
} from '@/api/recurring-rules'
import {
  useDeleteTransaction,
  useTransactions,
  useTransactionSummary,
  useUpdateTransaction,
} from '@/api/transactions'
import type {
  InstallmentScope,
  RecurringScope,
  Transaction,
  TransactionType,
  UpdateTransactionBody,
} from '@/api/transactions'
import { TransactionFormDialog } from '@/modules/transactions/components/TransactionFormDialog'

import { DeleteTransactionDialog } from './components/DeleteTransactionDialog'
import { InstallmentScopeDialog } from './components/InstallmentScopeDialog'
import {
  RecurringScopeDialog,
  type RecurringDeleteScope,
} from './components/RecurringScopeDialog'
import {
  TransactionFilters,
  type FilterValues,
} from './components/TransactionFilters'
import { TransactionFooter } from './components/TransactionFooter'
import { TransactionHeader } from './components/TransactionHeader'
import type { VirtualOccurrenceAction } from './components/TransactionItem'
import { TransactionList } from './components/TransactionList'

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  type: '',
  isPaid: '',
  bankAccountId: '',
  categoryId: '',
}

const resolveIsPaidFilter = (value: FilterValues['isPaid']) => {
  if (value === 'PAID') return true
  if (value === 'PENDING') return false
  return undefined
}

const toastError = (err: unknown, fallback: string) => {
  toast.error(err instanceof Error ? err.message : fallback)
}

export const TransactionsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formDialogType, setFormDialogType] =
    useState<TransactionType>('EXPENSE')
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [recurringEditScope, setRecurringEditScope] =
    useState<RecurringScope | null>(null)
  const [installmentEditScope, setInstallmentEditScope] =
    useState<InstallmentScope | null>(null)

  const [deleteTransaction, setDeleteTransaction] =
    useState<Transaction | null>(null)
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<{
    transaction: Transaction
    body: UpdateTransactionBody
  } | null>(null)
  const [pendingInstallmentEdit, setPendingInstallmentEdit] = useState<{
    transaction: Transaction
    body: UpdateTransactionBody
  } | null>(null)
  const [recurringScopeDialog, setRecurringScopeDialog] = useState<{
    transaction: Transaction
    mode: 'edit' | 'delete'
    action?: 'submit-edit'
  } | null>(null)
  const [installmentScopeDialog, setInstallmentScopeDialog] = useState<{
    transaction: Transaction
    mode: 'edit' | 'delete'
    action?: 'submit-edit' | 'toggle-paid'
  } | null>(null)

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
  const isPaidFilter = resolveIsPaidFilter(filters.isPaid)

  const queryParams = {
    startDate,
    endDate,
    ...(filters.type ? { type: filters.type } : {}),
    ...(isPaidFilter === undefined ? {} : { isPaid: isPaidFilter }),
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
  const { data: recurringRulesData } = useRecurringRules()

  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const updateRecurringRule = useUpdateRecurringRule()
  const cancelRecurringOccurrence = useCancelRecurringOccurrence()
  const deleteRecurringRule = useDeleteRecurringRule()

  const bankAccounts = bankAccountsData?.bankAccounts ?? []
  const categories = categoriesData?.categories ?? []
  const transactions = transactionsData?.transactions ?? []
  const recurringRules = useMemo(
    () => recurringRulesData?.recurringRules ?? [],
    [recurringRulesData?.recurringRules]
  )

  const resetEditState = useCallback(() => {
    setEditingTransaction(null)
    setRecurringEditScope(null)
    setInstallmentEditScope(null)
  }, [])

  const handleNewTransaction = useCallback(
    (type: TransactionType) => {
      resetEditState()
      setFormDialogType(type)
      setFormDialogOpen(true)
    },
    [resetEditState]
  )

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setRecurringEditScope(null)
    setInstallmentEditScope(null)
    setFormDialogType(transaction.type)
    setFormDialogOpen(true)
  }, [])

  const handleTogglePaid = useCallback(
    (transaction: Transaction) => {
      if (transaction.recurringRuleId || transaction.installmentGroupId) {
        if (transaction.recurringRuleId) {
          updateRecurringRule.mutate(
            {
              id: transaction.recurringRuleId,
              body: {
                scope: 'THIS',
                occurrenceDate: transaction.date.slice(0, 10),
                isPaid: !transaction.isPaid,
              },
            },
            {
              onError: (err) => {
                toastError(err, 'Erro ao atualizar status')
              },
            }
          )
          return
        }

        setInstallmentScopeDialog({
          transaction,
          mode: 'edit',
          action: 'toggle-paid',
        })
        return
      }

      updateMutation.mutate(
        { id: transaction.id, body: { isPaid: !transaction.isPaid } },
        {
          onError: (err) => {
            toastError(err, 'Erro ao atualizar status')
          },
        }
      )
    },
    [updateMutation, updateRecurringRule]
  )

  const handleDeleteFromForm = useCallback((transaction: Transaction) => {
    setFormDialogOpen(false)
    if (transaction.recurringRuleId) {
      setRecurringScopeDialog({ transaction, mode: 'delete' })
      return
    }

    if (transaction.installmentGroupId) {
      setInstallmentScopeDialog({ transaction, mode: 'delete' })
      return
    }

    setDeleteTransaction(transaction)
  }, [])

  const handleVirtualAction = useCallback(
    (action: VirtualOccurrenceAction, transaction: Transaction) => {
      if (action !== 'mark-as-paid') return
      if (!transaction.recurringRuleId) return

      updateRecurringRule.mutate(
        {
          id: transaction.recurringRuleId,
          body: {
            scope: 'THIS',
            occurrenceDate: transaction.date.slice(0, 10),
            isPaid: true,
          },
        },
        {
          onSuccess: () => {
            toast.success('Lançamento registrado como pago')
          },
          onError: (err) => {
            toastError(err, 'Erro ao registrar lançamento')
          },
        }
      )
    },
    [updateRecurringRule]
  )

  const handleRecurringSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      setPendingRecurringEdit({ transaction, body })
      setRecurringScopeDialog({
        transaction,
        mode: 'edit',
        action: 'submit-edit',
      })
      resetEditState()
      setFormDialogOpen(false)
    },
    [resetEditState]
  )

  const handleInstallmentSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      setPendingInstallmentEdit({ transaction, body })
      setInstallmentScopeDialog({
        transaction,
        mode: 'edit',
        action: 'submit-edit',
      })
      resetEditState()
      setFormDialogOpen(false)
    },
    [resetEditState]
  )

  const handleRecurringScopeConfirm = useCallback(
    (scope: RecurringDeleteScope) => {
      if (!recurringScopeDialog) return
      const recurringRuleId = recurringScopeDialog.transaction.recurringRuleId
      if (!recurringRuleId) return
      const { action, transaction, mode } = recurringScopeDialog

      if (mode === 'edit') {
        if (scope === 'ALL') return

        if (action === 'submit-edit' && pendingRecurringEdit) {
          updateRecurringRule.mutate(
            {
              id: recurringRuleId,
              body: {
                ...pendingRecurringEdit.body,
                scope,
                occurrenceDate: transaction.date.slice(0, 10),
              },
            },
            {
              onSuccess: () => {
                toast.success('Lançamento recorrente atualizado')
                setPendingRecurringEdit(null)
                setEditingTransaction(null)
                setRecurringScopeDialog(null)
              },
              onError: (err) => {
                toastError(err, 'Erro ao atualizar lançamento recorrente')
              },
            }
          )
          return
        }

        setRecurringScopeDialog(null)
        return
      }

      if (scope === 'ALL') {
        const rule = recurringRules.find((item) => item.id === recurringRuleId)
        deleteRecurringRule.mutate(
          {
            id: recurringRuleId,
            body: {
              endDate: (rule?.startDate ?? transaction.date).slice(0, 10),
            },
          },
          {
            onSuccess: () => {
              toast.success('Regra recorrente excluída')
              setRecurringScopeDialog(null)
            },
            onError: (err) => {
              toastError(err, 'Erro ao excluir regra recorrente')
            },
          }
        )
        return
      }

      cancelRecurringOccurrence.mutate(
        {
          id: recurringRuleId,
          body: {
            scope,
            occurrenceDate: transaction.date.slice(0, 10),
          },
        },
        {
          onSuccess: () => {
            toast.success('Lançamento recorrente excluído')
            setRecurringScopeDialog(null)
          },
          onError: (err) => {
            toastError(err, 'Erro ao excluir lançamento recorrente')
          },
        }
      )
    },
    [
      cancelRecurringOccurrence,
      deleteRecurringRule,
      recurringRules,
      recurringScopeDialog,
      pendingRecurringEdit,
      updateRecurringRule,
    ]
  )

  const handleInstallmentScopeConfirm = useCallback(
    (scope: InstallmentScope) => {
      if (!installmentScopeDialog) return
      const { action, transaction, mode } = installmentScopeDialog

      if (mode === 'edit') {
        if (action === 'toggle-paid') {
          updateMutation.mutate(
            {
              id: transaction.id,
              body: { scope, isPaid: !transaction.isPaid },
            },
            {
              onSuccess: () => {
                toast.success('Status atualizado')
                setInstallmentScopeDialog(null)
              },
              onError: (err) => {
                toastError(err, 'Erro ao atualizar status')
              },
            }
          )
          return
        }

        if (action === 'submit-edit' && pendingInstallmentEdit) {
          updateMutation.mutate(
            {
              id: transaction.id,
              body: {
                ...pendingInstallmentEdit.body,
                scope,
              },
            },
            {
              onSuccess: () => {
                toast.success('Lançamento parcelado atualizado')
                setPendingInstallmentEdit(null)
                setEditingTransaction(null)
                setInstallmentScopeDialog(null)
              },
              onError: (err) => {
                toastError(err, 'Erro ao atualizar lançamento parcelado')
              },
            }
          )
          return
        }

        setInstallmentScopeDialog(null)
        return
      }

      setInstallmentScopeDialog(null)
      setDeleteTransaction(null)
      deleteMutation.mutate(
        { id: transaction.id, body: { scope } },
        {
          onSuccess: () => {
            toast.success('Lançamento parcelado excluído')
          },
          onError: (err) => {
            toastError(err, 'Erro ao excluir lançamento parcelado')
          },
        }
      )
    },
    [
      deleteMutation,
      installmentScopeDialog,
      pendingInstallmentEdit,
      updateMutation,
    ]
  )

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
            onVirtualAction={handleVirtualAction}
          />
        </div>

        <TransactionFooter summary={summaryData} isLoading={isLoadingSummary} />
      </div>

      <TransactionFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open)
          if (!open) resetEditState()
        }}
        type={formDialogType}
        transaction={editingTransaction}
        defaultCalendarMonth={currentMonth}
        bankAccounts={bankAccounts}
        categories={categories}
        onDelete={handleDeleteFromForm}
        onRecurringSubmit={handleRecurringSubmit}
        onInstallmentSubmit={handleInstallmentSubmit}
        recurringScope={recurringEditScope}
        installmentScope={installmentEditScope}
      />

      <DeleteTransactionDialog
        transaction={deleteTransaction}
        open={!!deleteTransaction}
        onOpenChange={(open) => {
          if (!open) setDeleteTransaction(null)
        }}
      />

      <RecurringScopeDialog
        transaction={recurringScopeDialog?.transaction ?? null}
        open={!!recurringScopeDialog}
        mode={recurringScopeDialog?.mode ?? 'edit'}
        isPending={
          updateRecurringRule.isPending ||
          cancelRecurringOccurrence.isPending ||
          deleteRecurringRule.isPending
        }
        onOpenChange={(open) => {
          if (!open) {
            if (recurringScopeDialog?.action === 'submit-edit') {
              setPendingRecurringEdit(null)
            }
            setRecurringScopeDialog(null)
          }
        }}
        onConfirm={handleRecurringScopeConfirm}
      />

      <InstallmentScopeDialog
        transaction={installmentScopeDialog?.transaction ?? null}
        open={!!installmentScopeDialog}
        mode={installmentScopeDialog?.mode ?? 'edit'}
        isPending={updateMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            if (installmentScopeDialog?.action === 'submit-edit') {
              setPendingInstallmentEdit(null)
            }
            setInstallmentScopeDialog(null)
          }
        }}
        onConfirm={handleInstallmentScopeConfirm}
      />
    </Fragment>
  )
}
