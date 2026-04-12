export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'OTHER'

export type BankAccount = {
  id: string
  name: string
  type: BankAccountType
  color: string
  icon: string
  initialBalance: number
  currentBalance: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type BankAccountListResponse = {
  bankAccounts: BankAccount[]
}

export type CreateBankAccountBody = {
  name: string
  type: BankAccountType
  color?: string
  icon?: string
  initialBalance?: number
}

export type UpdateBankAccountBody = Partial<CreateBankAccountBody>
