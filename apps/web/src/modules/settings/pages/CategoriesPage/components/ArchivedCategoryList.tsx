import { Button } from '@workspace/ui/components/button'
import { toast } from 'sonner'

import { useRestoreCategory } from '@/api/categories'
import type { Category } from '@/api/categories'

type Props = {
  categories: Category[]
}

export const ArchivedCategoryList = ({ categories }: Props) => {
  const restore = useRestoreCategory()

  const handleRestore = (category: Category) => {
    restore.mutate(category.id, {
      onSuccess: () => toast.success('Categoria restaurada'),
      onError: () => toast.error('Erro ao restaurar categoria'),
    })
  }

  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-xl px-3 py-2 opacity-60"
        >
          <span className="text-sm">{category.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRestore(category)}
            disabled={restore.isPending}
          >
            Restaurar
          </Button>
        </div>
      ))}
    </div>
  )
}
