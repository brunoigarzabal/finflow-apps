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

import { useArchiveCategory } from '@/api/categories'
import type { Category } from '@/api/categories'

type Props = {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ArchiveCategoryDialog = ({
  category,
  open,
  onOpenChange,
}: Props) => {
  const archive = useArchiveCategory()

  const handleConfirm = () => {
    if (!category) return
    archive.mutate(category.id, {
      onSuccess: () => {
        toast.success('Categoria arquivada')
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Erro ao arquivar categoria')
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja arquivar a categoria{' '}
            <strong>{category?.name}</strong>? Ela não aparecerá mais na lista
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
