export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export type Transaction = {
  id: string
  description: string
  amount: number
  type: TransactionType
  isPaid: boolean
  date: string
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  bankAccountId: string
}

export type TransactionSummary = {
  totalIncome: number
  totalExpense: number
  balance: number
}

export type SummaryByCategoryItem = {
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  total: number
  percentage: number
}

export type SummaryByCategoryResponse = {
  items: SummaryByCategoryItem[]
}

export type TransactionListResponse = {
  transactions: Transaction[]
  total: number
}

export type ListTransactionsParams = {
  type?: TransactionType
  isPaid?: boolean
  startDate?: string
  endDate?: string
  bankAccountId?: string
  page?: number
  perPage?: number
}

export type SummaryParams = {
  startDate?: string
  endDate?: string
  bankAccountId?: string
}

export type SummaryByCategoryParams = {
  type?: TransactionType
  startDate?: string
  endDate?: string
  bankAccountId?: string
}
