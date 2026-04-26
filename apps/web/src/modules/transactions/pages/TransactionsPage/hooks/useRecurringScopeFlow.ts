import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  useCancelRecurringOccurrence,
  useDeleteRecurringRule,
  useUpdateRecurringRule,
} from '@/api/recurring-rules'
import type { Transaction, UpdateTransactionBody } from '@/api/transactions'
import { toastError } from '@/lib/toastError'

import type { RecurringDeleteScope } from '../components/RecurringScopeDialog'

type RecurringScopeDialogState = {
  transaction: Transaction
  mode: 'edit' | 'delete'
  action?: 'submit-edit'
}

type Params = {
  recurringRules: { id: string; startDate: string }[]
}

export const useRecurringScopeFlow = ({ recurringRules }: Params) => {
  const updateRecurringRule = useUpdateRecurringRule()
  const cancelRecurringOccurrence = useCancelRecurringOccurrence()
  const deleteRecurringRule = useDeleteRecurringRule()

  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<{
    transaction: Transaction
    body: UpdateTransactionBody
  } | null>(null)
  const [recurringScopeDialog, setRecurringScopeDialog] =
    useState<RecurringScopeDialogState | null>(null)

  const requestRecurringDelete = useCallback((transaction: Transaction) => {
    setRecurringScopeDialog({ transaction, mode: 'delete' })
  }, [])

  const requestRecurringEditSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      setPendingRecurringEdit({ transaction, body })
      setRecurringScopeDialog({
        transaction,
        mode: 'edit',
        action: 'submit-edit',
      })
    },
    []
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
      pendingRecurringEdit,
      recurringRules,
      recurringScopeDialog,
      updateRecurringRule,
    ]
  )

  const handleRecurringDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (recurringScopeDialog?.action === 'submit-edit') {
          setPendingRecurringEdit(null)
        }
        setRecurringScopeDialog(null)
      }
    },
    [recurringScopeDialog?.action]
  )

  const handleRecurringTogglePaid = useCallback(
    (transaction: Transaction) => {
      if (!transaction.recurringRuleId) return

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
    },
    [updateRecurringRule]
  )

  const handleVirtualOccurrencePaid = useCallback(
    (transaction: Transaction) => {
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

  return {
    recurringScopeDialog,
    requestRecurringDelete,
    requestRecurringEditSubmit,
    handleRecurringScopeConfirm,
    handleRecurringDialogOpenChange,
    handleRecurringTogglePaid,
    handleVirtualOccurrencePaid,
    recurringScopePending:
      updateRecurringRule.isPending ||
      cancelRecurringOccurrence.isPending ||
      deleteRecurringRule.isPending,
  }
}
