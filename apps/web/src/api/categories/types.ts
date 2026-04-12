export type Category = {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  isDefault: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type CategoryListResponse = {
  categories: Category[]
}

export type ListCategoriesParams = {
  type?: 'INCOME' | 'EXPENSE'
  archived?: boolean
}
