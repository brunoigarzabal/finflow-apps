import { useCallback, useState } from 'react'

import type {
  InstallmentScope,
  RecurringScope,
  Transaction,
  TransactionType,
  UpdateTransactionBody,
} from '@/api/transactions'

type Params = {
  onRequestRecurringDelete: (transaction: Transaction) => void
  onRequestInstallmentDelete: (transaction: Transaction) => void
  onRequestRecurringSubmit: (
    transaction: Transaction,
    body: UpdateTransactionBody
  ) => void
  onRequestInstallmentSubmit: (
    transaction: Transaction,
    body: UpdateTransactionBody
  ) => void
}

export const useTransactionFormDialog = ({
  onRequestRecurringDelete,
  onRequestInstallmentDelete,
  onRequestRecurringSubmit,
  onRequestInstallmentSubmit,
}: Params) => {
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

  const handleDeleteFromForm = useCallback(
    (transaction: Transaction) => {
      setFormDialogOpen(false)

      if (transaction.recurringRuleId) {
        onRequestRecurringDelete(transaction)
        return
      }

      if (transaction.installmentGroupId) {
        onRequestInstallmentDelete(transaction)
        return
      }

      setDeleteTransaction(transaction)
    },
    [onRequestInstallmentDelete, onRequestRecurringDelete]
  )

  const handleRecurringSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      onRequestRecurringSubmit(transaction, body)
      resetEditState()
      setFormDialogOpen(false)
    },
    [onRequestRecurringSubmit, resetEditState]
  )

  const handleInstallmentSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      onRequestInstallmentSubmit(transaction, body)
      resetEditState()
      setFormDialogOpen(false)
    },
    [onRequestInstallmentSubmit, resetEditState]
  )

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormDialogOpen(open)

      if (!open) {
        resetEditState()
      }
    },
    [resetEditState]
  )

  const handleSimpleDeleteOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDeleteTransaction(null)
    }
  }, [])

  return {
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
  }
}
