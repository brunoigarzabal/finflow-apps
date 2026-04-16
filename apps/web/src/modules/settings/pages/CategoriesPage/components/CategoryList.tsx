import { Button } from '@workspace/ui/components/button'
import { Fragment } from 'react'

import type { Category, CategoryType } from '@/api/categories'

import { CategoryItem } from './CategoryItem'
import { CategoryItemSkeleton } from './CategoryItemSkeleton'

type Props = {
  categories: Category[]
  isLoading: boolean
  type: CategoryType
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
  onCreate: () => void
}

export const CategoryList = ({
  categories,
  isLoading,
  type,
  onEdit,
  onArchive,
  onCreate,
}: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <CategoryItemSkeleton />
        <CategoryItemSkeleton />
        <CategoryItemSkeleton />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Você ainda não tem categorias{' '}
          {type === 'EXPENSE' ? 'de despesa' : 'de receita'}.
        </p>
        <Button onClick={onCreate}>Criar primeira categoria</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <Fragment key={category.id}>
          <CategoryItem
            category={category}
            onEdit={onEdit}
            onArchive={onArchive}
          />
        </Fragment>
      ))}
    </div>
  )
}
