import { createFileRoute } from '@tanstack/react-router'

import { CategoriesPage } from '@/modules/settings'

export const Route = createFileRoute('/_authenticated/settings/categories')({
  component: CategoriesPage,
})
