export type DashboardBankAccount = {
  id: string
  name: string
  color: string
  icon: string
  currentBalance: number
}

export type DashboardSummary = {
  totalIncome: number
  totalExpense: number
}

export type DashboardData = {
  totalBalance: number
  bankAccounts: DashboardBankAccount[]
  summary: DashboardSummary
}
