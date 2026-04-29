export type CategoryType = 'INCOME' | 'EXPENSE'

export type Category = {
  id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  slug: string | null
  isDefault: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type CategoryListResponse = {
  categories: Category[]
}

export type ListCategoriesParams = {
  type?: CategoryType
  archived?: boolean
}

export type CreateCategoryBody = {
  name: string
  type: CategoryType
  color: string
  icon: string
}

export type UpdateCategoryBody = Partial<CreateCategoryBody>
