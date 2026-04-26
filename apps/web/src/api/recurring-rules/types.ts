import type {
  RecurringRule,
  RecurringScope,
  Transaction,
} from '@/api/transactions'

export type RecurringRuleListResponse = {
  recurringRules: RecurringRule[]
}

export type UpdateRecurringRuleBody = {
  scope: RecurringScope
  occurrenceDate: string
  date?: string
  amount?: number
  description?: string
  categoryId?: string
  bankAccountId?: string
  isPaid?: boolean
  notes?: string | null
}

export type UpdateRecurringRuleResponse = {
  recurringRule?: RecurringRule
  transaction?: Transaction
}

export type CancelRecurringOccurrenceBody = {
  occurrenceDate: string
  scope: RecurringScope
}

export type DeleteRecurringRuleBody = {
  endDate: string
}
