import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'

import type { Category } from '@/api/categories'
import { getIconByName } from '@/lib/icons'

type Props = {
  category: Category
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
}

export const CategoryItem = ({ category, onEdit, onArchive }: Props) => {
  const icon = getIconByName(category.icon)

  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2">
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-full"
          style={{ backgroundColor: category.color }}
        >
          <HugeiconsIcon
            icon={icon}
            strokeWidth={1.5}
            className="size-5 text-white"
          />
        </div>
        <span className="text-sm font-medium">{category.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onArchive(category)}>
          Arquivar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
          Editar
        </Button>
      </div>
    </div>
  )
}
