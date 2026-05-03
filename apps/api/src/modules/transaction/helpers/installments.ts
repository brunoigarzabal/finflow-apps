import {
  addMonthsPreservingDay,
  isDateInFuture,
} from '@/shared/helpers/date.js'

import type { RecurringFrequency } from '../../../../generated/prisma/enums.js'

type InstallmentFrequency = Extract<
  RecurringFrequency,
  'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY'
>

export interface InstallmentDraft {
  amount: number
  date: Date
  isPaid: boolean
  installmentNumber: number
  description: string
}

export function monthsByInstallmentFrequency(
  frequency: RecurringFrequency
): number {
  if (frequency === 'BIMONTHLY') {
    return 2
  }
  if (frequency === 'QUARTERLY') {
    return 3
  }
  return 1
}

export function buildInstallments(input: {
  amount: number
  count: number
  frequency: InstallmentFrequency
  startDate: Date
  description: string
  isPaid: boolean
}): InstallmentDraft[] {
  const baseAmount = Math.floor(input.amount / input.count)
  const remainder = input.amount % input.count
  const months = monthsByInstallmentFrequency(input.frequency)

  return Array.from({ length: input.count }, (_, index) => {
    const date = addMonthsPreservingDay(input.startDate, index * months)

    return {
      amount: baseAmount + (index === 0 ? remainder : 0),
      date,
      isPaid: input.isPaid && !isDateInFuture(date),
      installmentNumber: index + 1,
      description: input.description,
    }
  })
}
