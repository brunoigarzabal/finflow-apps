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

import { useUnlinkGoogle } from '@/api/auth'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UnlinkGoogleDialog = ({ open, onOpenChange }: Props) => {
  const unlinkGoogle = useUnlinkGoogle()

  const handleConfirm = () => {
    unlinkGoogle.mutate(undefined, {
      onSuccess: () => {
        toast.success('Conta Google desvinculada')
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Erro ao desvincular conta Google')
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desvincular conta Google</AlertDialogTitle>
          <AlertDialogDescription>
            Você não poderá mais entrar com o Google e precisará usar seu e-mail
            e senha. Enquanto seu e-mail for o mesmo da conta Google, entrar com
            o Google novamente reconecta as contas; se você alterar o e-mail
            depois de desvincular, um novo login com o Google criará uma conta
            separada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={unlinkGoogle.isPending}
          >
            Desvincular
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
