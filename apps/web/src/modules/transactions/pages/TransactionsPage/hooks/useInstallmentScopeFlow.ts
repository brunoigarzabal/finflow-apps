import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  useDeleteTransaction,
  useUpdateTransaction,
  type InstallmentScope,
  type Transaction,
  type UpdateTransactionBody,
} from '@/api/transactions'
import { toastError } from '@/lib/toastError'

type InstallmentScopeDialogState = {
  transaction: Transaction
  mode: 'edit' | 'delete'
  action?: 'submit-edit' | 'toggle-paid'
}

export const useInstallmentScopeFlow = () => {
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const [pendingInstallmentEdit, setPendingInstallmentEdit] = useState<{
    transaction: Transaction
    body: UpdateTransactionBody
  } | null>(null)
  const [installmentScopeDialog, setInstallmentScopeDialog] =
    useState<InstallmentScopeDialogState | null>(null)

  const requestInstallmentDelete = useCallback((transaction: Transaction) => {
    setInstallmentScopeDialog({ transaction, mode: 'delete' })
  }, [])

  const requestInstallmentEditSubmit = useCallback(
    (transaction: Transaction, body: UpdateTransactionBody) => {
      setPendingInstallmentEdit({ transaction, body })
      setInstallmentScopeDialog({
        transaction,
        mode: 'edit',
        action: 'submit-edit',
      })
    },
    []
  )

  const requestInstallmentTogglePaid = useCallback(
    (transaction: Transaction) => {
      setInstallmentScopeDialog({
        transaction,
        mode: 'edit',
        action: 'toggle-paid',
      })
    },
    []
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

  const handleInstallmentDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (installmentScopeDialog?.action === 'submit-edit') {
          setPendingInstallmentEdit(null)
        }
        setInstallmentScopeDialog(null)
      }
    },
    [installmentScopeDialog?.action]
  )

  return {
    installmentScopeDialog,
    requestInstallmentDelete,
    requestInstallmentEditSubmit,
    requestInstallmentTogglePaid,
    handleInstallmentScopeConfirm,
    handleInstallmentDialogOpenChange,
    installmentScopePending:
      updateMutation.isPending || deleteMutation.isPending,
  }
}
