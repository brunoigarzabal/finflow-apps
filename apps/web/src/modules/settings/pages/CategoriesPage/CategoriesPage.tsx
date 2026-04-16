import { Button } from '@workspace/ui/components/button'
import { Fragment, useCallback, useState } from 'react'

import { useCategories } from '@/api/categories'
import type { Category, CategoryType } from '@/api/categories'

import { ArchiveCategoryDialog } from './components/ArchiveCategoryDialog'
import { ArchivedCategoryList } from './components/ArchivedCategoryList'
import { CategoryFormDialog } from './components/CategoryFormDialog'
import { CategoryList } from './components/CategoryList'
import { CategoryTabs } from './components/CategoryTabs'

export const CategoriesPage = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE')
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [archiveDialogCategory, setArchiveDialogCategory] =
    useState<Category | null>(null)
  const [archivedExpanded, setArchivedExpanded] = useState(false)

  const { data: activeData, isLoading: isLoadingActive } = useCategories({
    type: activeTab,
  })
  const { data: archivedData } = useCategories({
    type: activeTab,
    archived: true,
  })

  const activeCategories = activeData?.categories ?? []
  const archivedCategories = archivedData?.categories ?? []

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setFormDialogOpen(true)
  }, [])

  const handleNewCategory = useCallback(() => {
    setEditingCategory(null)
    setFormDialogOpen(true)
  }, [])

  const handleFormClose = useCallback((open: boolean) => {
    setFormDialogOpen(open)
    if (!open) setEditingCategory(null)
  }, [])

  const handleArchiveClose = useCallback((open: boolean) => {
    if (!open) setArchiveDialogCategory(null)
  }, [])

  const handleTabChange = useCallback((tab: CategoryType) => {
    setActiveTab(tab)
    setArchivedExpanded(false)
  }, [])

  const newButtonLabel =
    activeTab === 'EXPENSE'
      ? '+ Categoria de despesa'
      : '+ Categoria de receita'

  const dialogType = editingCategory?.type ?? activeTab

  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Button onClick={handleNewCategory} size="sm">
            {newButtonLabel}
          </Button>
        </div>

        <CategoryTabs value={activeTab} onChange={handleTabChange} />

        {archivedCategories.length > 0 && (
          <button
            type="button"
            className="self-start text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setArchivedExpanded((prev) => !prev)}
          >
            {archivedCategories.length}{' '}
            {archivedCategories.length === 1 ? 'arquivada' : 'arquivadas'}
          </button>
        )}

        <CategoryList
          categories={activeCategories}
          isLoading={isLoadingActive}
          type={activeTab}
          onEdit={handleEdit}
          onArchive={setArchiveDialogCategory}
          onCreate={handleNewCategory}
        />

        {archivedExpanded && archivedCategories.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Arquivadas
            </h2>
            <ArchivedCategoryList categories={archivedCategories} />
          </div>
        )}
      </div>

      <CategoryFormDialog
        category={editingCategory}
        type={dialogType}
        open={formDialogOpen}
        onOpenChange={handleFormClose}
      />

      <ArchiveCategoryDialog
        category={archiveDialogCategory}
        open={!!archiveDialogCategory}
        onOpenChange={handleArchiveClose}
      />
    </Fragment>
  )
}
