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
import { toast } from 'sonner'

import { useArchiveBankAccount } from '@/api/bank-accounts'
import type { BankAccount } from '@/api/bank-accounts'

type Props = {
  account: BankAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ArchiveAccountDialog = ({
  account,
  open,
  onOpenChange,
}: Props) => {
  const archive = useArchiveBankAccount()

  const handleConfirm = () => {
    if (!account) return
    archive.mutate(account.id, {
      onSuccess: () => {
        toast.success('Conta arquivada')
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Erro ao arquivar conta')
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar conta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja arquivar a conta{' '}
            <strong>{account?.name}</strong>? Ela não aparecerá mais na lista
            principal, mas você poderá restaurá-la depois.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={archive.isPending}
          >
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
