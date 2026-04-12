import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Fragment } from 'react'
import { toast } from 'sonner'

import { useDeleteTransaction } from '@/api/transactions'
import type { Transaction } from '@/api/transactions'

type Props = {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteTransactionDialog = ({
  transaction,
  open,
  onOpenChange,
}: Props) => {
  const deleteMutation = useDeleteTransaction()

  const handleDelete = () => {
    if (!transaction) return

    deleteMutation.mutate(transaction.id, {
      onSuccess: () => {
        toast.success('Lançamento excluído')
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Erro ao excluir lançamento'
        )
      },
    })
  }

  return (
    <Fragment>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{transaction?.description}
              &quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  )
}
