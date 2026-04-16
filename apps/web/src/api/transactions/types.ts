export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export type Transaction = {
  id: string
  description: string
  amount: number
  type: TransactionType
  isPaid: boolean
  date: string
  notes: string | null
  transferId: string | null
  isTransferOut: boolean | null
  createdAt: string
  updatedAt: string
  bankAccount: { id: string; name: string; color: string; icon: string }
  category: { id: string; name: string; color: string; icon: string } | null
  relatedBankAccount: {
    id: string
    name: string
    color: string
    icon: string
  } | null
}

export type TransactionDetail = {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  isPaid: boolean
  notes: string | null
  transferId: string | null
  isTransferOut: boolean | null
  createdAt: string
  updatedAt: string
  bankAccount: { id: string; name: string; color: string; icon: string }
  category: { id: string; name: string; color: string; icon: string } | null
  relatedTransaction: {
    id: string
    amount: number
    type: TransactionType
    bankAccount: { id: string; name: string; color: string; icon: string }
  } | null
}

export type CreateTransactionBody = {
  type: TransactionType
  amount: number
  description: string
  date: string
  bankAccountId: string
  categoryId?: string
  isPaid: boolean
  notes?: string
  destinationBankAccountId?: string
}

export type UpdateTransactionBody = {
  amount?: number
  description?: string
  date?: string
  bankAccountId?: string
  categoryId?: string
  isPaid?: boolean
  notes?: string | null
}

export type TransactionSummary = {
  previousBalance: number
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
  pendingBalance: number
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
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export type ListTransactionsParams = {
  type?: TransactionType
  isPaid?: boolean
  startDate?: string
  endDate?: string
  bankAccountId?: string
  categoryId?: string
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
