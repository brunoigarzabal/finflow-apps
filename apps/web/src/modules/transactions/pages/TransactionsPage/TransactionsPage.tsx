import { Fragment, useCallback } from 'react'

import { useUpdateTransaction, type Transaction } from '@/api/transactions'
import { toastError } from '@/lib/toastError'
import { TransactionFormDialog } from '@/modules/transactions/components/TransactionFormDialog'

import { DeleteTransactionDialog } from './components/DeleteTransactionDialog'
import { InstallmentScopeDialog } from './components/InstallmentScopeDialog'
import { RecurringScopeDialog } from './components/RecurringScopeDialog'
import { TransactionFilters } from './components/TransactionFilters'
import { TransactionFooter } from './components/TransactionFooter'
import { TransactionHeader } from './components/TransactionHeader'
import type { VirtualOccurrenceAction } from './components/TransactionItem'
import { TransactionList } from './components/TransactionList'
import { useInstallmentScopeFlow } from './hooks/useInstallmentScopeFlow'
import { useRecurringScopeFlow } from './hooks/useRecurringScopeFlow'
import { useTransactionFormDialog } from './hooks/useTransactionFormDialog'
import { useTransactionQueryState } from './hooks/useTransactionQueryState'
import { useTransactionsPageData } from './hooks/useTransactionsPageData'

export const TransactionsPage = () => {
  const {
    currentMonth,
    filters,
    queryParams,
    summaryParams,
    handleMonthChange,
    handleFilterChange,
  } = useTransactionQueryState()
  const {
    transactions,
    summary,
    bankAccounts,
    categories,
    recurringRules,
    isLoadingTransactions,
    isLoadingSummary,
  } = useTransactionsPageData({
    queryParams,
    summaryParams,
  })
  const recurringScopeFlow = useRecurringScopeFlow({ recurringRules })
  const installmentScopeFlow = useInstallmentScopeFlow()
  const updateMutation = useUpdateTransaction()
  const {
    formDialogOpen,
    formDialogType,
    editingTransaction,
    recurringEditScope,
    installmentEditScope,
    deleteTransaction,
    handleFormOpenChange,
    handleSimpleDeleteOpenChange,
    handleNewTransaction,
    handleEdit,
    handleDeleteFromForm,
    handleRecurringSubmit,
    handleInstallmentSubmit,
  } = useTransactionFormDialog({
    onRequestRecurringDelete: recurringScopeFlow.requestRecurringDelete,
    onRequestInstallmentDelete: installmentScopeFlow.requestInstallmentDelete,
    onRequestRecurringSubmit: recurringScopeFlow.requestRecurringEditSubmit,
    onRequestInstallmentSubmit:
      installmentScopeFlow.requestInstallmentEditSubmit,
  })

  const handleVirtualAction = useCallback(
    (action: VirtualOccurrenceAction, transaction: Transaction) => {
      if (action !== 'mark-as-paid') return
      if (!transaction.recurringRuleId) return

      recurringScopeFlow.handleVirtualOccurrencePaid(transaction)
    },
    [recurringScopeFlow]
  )

  const handleTogglePaid = useCallback(
    (transaction: Transaction) => {
      if (transaction.recurringRuleId || transaction.installmentGroupId) {
        if (transaction.recurringRuleId) {
          recurringScopeFlow.handleRecurringTogglePaid(transaction)
          return
        }

        installmentScopeFlow.requestInstallmentTogglePaid(transaction)
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
    [installmentScopeFlow, recurringScopeFlow, updateMutation]
  )

  return (
    <Fragment>
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-6 pt-0">
          <div className="sticky top-0 border-b bg-background/80 pt-6 pb-6 backdrop-blur-md">
            <div className="flex flex-1 flex-col gap-6">
              <TransactionHeader
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
                onNewTransaction={handleNewTransaction}
              />

              <TransactionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                bankAccounts={bankAccounts}
                categories={categories}
              />
            </div>
          </div>

          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
            onEdit={handleEdit}
            onTogglePaid={handleTogglePaid}
            onVirtualAction={handleVirtualAction}
          />
        </div>

        <TransactionFooter summary={summary} isLoading={isLoadingSummary} />
      </div>

      <TransactionFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormOpenChange}
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
        onOpenChange={handleSimpleDeleteOpenChange}
      />

      <RecurringScopeDialog
        transaction={
          recurringScopeFlow.recurringScopeDialog?.transaction ?? null
        }
        open={!!recurringScopeFlow.recurringScopeDialog}
        mode={recurringScopeFlow.recurringScopeDialog?.mode ?? 'edit'}
        isPending={recurringScopeFlow.recurringScopePending}
        onOpenChange={recurringScopeFlow.handleRecurringDialogOpenChange}
        onConfirm={recurringScopeFlow.handleRecurringScopeConfirm}
      />

      <InstallmentScopeDialog
        transaction={
          installmentScopeFlow.installmentScopeDialog?.transaction ?? null
        }
        open={!!installmentScopeFlow.installmentScopeDialog}
        mode={installmentScopeFlow.installmentScopeDialog?.mode ?? 'edit'}
        isPending={installmentScopeFlow.installmentScopePending}
        onOpenChange={installmentScopeFlow.handleInstallmentDialogOpenChange}
        onConfirm={installmentScopeFlow.handleInstallmentScopeConfirm}
      />
    </Fragment>
  )
}
