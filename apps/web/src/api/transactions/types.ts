import type { BankAccount } from '@/api/bank-accounts'
import type { Category } from '@/api/categories'

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export type RecurringFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUAL'
  | 'ANNUAL'

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
}

export type InstallmentFrequency = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY'
export type InstallmentScope = 'THIS' | 'ALL_REMAINING'
export type RecurringScope = 'THIS' | 'THIS_AND_FUTURE'

export interface RecurringRule {
  id: string
  type: TransactionType
  amount: number
  description: string
  frequency: RecurringFrequency
  startDate: string
  endDate: string | null
  isPaid: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  bankAccount: Pick<BankAccount, 'id' | 'name' | 'color' | 'icon'>
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
}

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
  isVirtual?: boolean
  recurringRuleId?: string
  installmentGroupId?: string | null
  installmentNumber?: number | null
  installmentCount?: number | null
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
  recurringRuleId?: string
  isVirtual?: boolean
  installmentGroupId?: string | null
  installmentNumber?: number | null
  installmentCount?: number | null
}

export type CreateTransactionBody = {
  type: TransactionType
  amount: number
  description: string
  date: string
  bankAccountId: string
  categoryId?: string
  isPaid: boolean
  notes?: string | null
  destinationBankAccountId?: string
  recurring?: {
    frequency: RecurringFrequency
    endDate?: string
  }
  installment?: {
    count: number
    frequency: InstallmentFrequency
  }
}

export type CreateTransactionResponse =
  | TransactionDetail
  | {
      installmentGroup: {
        id: string
        totalAmount: number
        count: number
        frequency: RecurringFrequency
        createdAt: string
      }
      transactions: Transaction[]
    }
  | {
      recurringRule: RecurringRule
    }

export type DeleteTransactionBody = {
  scope?: InstallmentScope
}

export type UpdateTransactionBody = {
  amount?: number
  description?: string
  date?: string
  bankAccountId?: string
  categoryId?: string
  isPaid?: boolean
  notes?: string | null
  scope?: InstallmentScope
  recurring?: {
    frequency: RecurringFrequency
    endDate?: string
  }
}

export type TransactionSummary = {
  previousBalance: number
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
  pendingBalance: number
  overdueIncome: number
  overdueExpense: number
}

export type SummaryByCategoryItem = {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalAmount: number
  transactionCount: number
  percentageOfTotal: number
}

export type SummaryByCategoryResponse = {
  summaryByCategory: SummaryByCategoryItem[]
  total: number
}

export type TransactionListResponse = {
  transactions: Transaction[]
}

export type ListTransactionsParams = {
  type?: TransactionType
  isPaid?: boolean
  startDate?: string
  endDate?: string
  bankAccountId?: string
  categoryId?: string
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
  isPaid?: 'true' | 'false'
}

export type BalanceOverTimePoint = {
  date: string
  income: number
  expense: number
  balance: number
}

export type BalanceOverTimeResponse = {
  balanceOverTime: BalanceOverTimePoint[]
}

export type BalanceOverTimeGroupBy = 'daily' | 'weekly' | 'monthly'

export type BalanceOverTimeParams = {
  startDate?: string
  endDate?: string
  bankAccountId?: string
  includeUnpaid?: boolean
  groupBy?: BalanceOverTimeGroupBy
}
