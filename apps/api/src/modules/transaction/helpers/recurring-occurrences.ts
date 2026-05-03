import { recurringRuleInclude } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionInclude } from '@/shared/database/repositories/transaction.repository.js'
import {
  addDays,
  addMonthsPreservingDay,
  isDateInFuture,
} from '@/shared/helpers/date.js'

import type { PrismaClient } from '../../../../generated/prisma/client.js'
import type {
  RecurringFrequency,
  TransactionType,
} from '../../../../generated/prisma/enums.js'

type BasicEntity = {
  id: string
  name: string
  color: string
  icon: string
}

type RecurringRuleWithRelations = {
  id: string
  type: TransactionType
  amount: number
  description: string
  frequency: RecurringFrequency
  startDate: Date
  endDate: Date | null
  isPaid: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
  bankAccountId: string
  categoryId: string
  bankAccount: BasicEntity
  category: BasicEntity
}

export type RecurringOccurrence = {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: Date
  isPaid: boolean
  notes: string | null
  transferId: string | null
  isTransferOut: boolean | null
  installmentGroupId: string | null
  installmentNumber: number | null
  installmentCount?: number | null
  createdAt: Date
  updatedAt: Date
  userId?: string
  bankAccountId: string
  categoryId: string | null
  bankAccount: BasicEntity
  category: BasicEntity | null
  recurringRuleId: string
  isVirtual?: boolean
}

function nextOccurrenceDate(date: Date, frequency: RecurringFrequency): Date {
  if (frequency === 'DAILY') {
    return addDays(date, 1)
  }
  if (frequency === 'WEEKLY') {
    return addDays(date, 7)
  }
  if (frequency === 'BIWEEKLY') {
    return addDays(date, 14)
  }
  if (frequency === 'MONTHLY') {
    return addMonthsPreservingDay(date, 1)
  }
  if (frequency === 'BIMONTHLY') {
    return addMonthsPreservingDay(date, 2)
  }
  if (frequency === 'QUARTERLY') {
    return addMonthsPreservingDay(date, 3)
  }
  if (frequency === 'SEMIANNUAL') {
    return addMonthsPreservingDay(date, 6)
  }
  return addMonthsPreservingDay(date, 12)
}

export function calculateOccurrenceDates(
  rule: Pick<RecurringRuleWithRelations, 'startDate' | 'endDate' | 'frequency'>,
  periodStart: Date,
  periodEnd: Date
): Date[] {
  const dates: Date[] = []
  const effectiveEnd =
    rule.endDate && rule.endDate < periodEnd ? rule.endDate : periodEnd

  let current = new Date(rule.startDate)

  while (current <= effectiveEnd) {
    if (current >= periodStart) {
      dates.push(new Date(current))
    }
    current = nextOccurrenceDate(current, rule.frequency)
  }

  return dates
}

function makeOverrideKey(
  recurringRuleId: string,
  occurrenceDate: Date
): string {
  return `${recurringRuleId}:${formatDateKey(occurrenceDate)}`
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function makeVirtualOccurrence(
  rule: RecurringRuleWithRelations,
  occurrenceDate: Date
): RecurringOccurrence {
  const date = formatDateKey(occurrenceDate)

  return {
    id: `recurring:${rule.id}:${date}`,
    type: rule.type,
    amount: rule.amount,
    description: rule.description,
    date: occurrenceDate,
    isPaid: rule.isPaid && !isDateInFuture(occurrenceDate),
    notes: rule.notes,
    transferId: null,
    isTransferOut: null,
    installmentGroupId: null,
    installmentNumber: null,
    installmentCount: null,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    bankAccountId: rule.bankAccountId,
    categoryId: rule.categoryId,
    bankAccount: rule.bankAccount,
    category: rule.category,
    recurringRuleId: rule.id,
    isVirtual: true,
  }
}

export async function getRecurringOccurrences(
  prisma: PrismaClient,
  userId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<RecurringOccurrence[]> {
  const rules = await prisma.recurringRule.findMany({
    where: {
      userId,
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    include: recurringRuleInclude,
  })

  if (rules.length === 0) {
    return []
  }

  const overrides = await prisma.recurringOverride.findMany({
    where: {
      recurringRuleId: { in: rules.map((rule) => rule.id) },
      occurrenceDate: { gte: periodStart, lte: periodEnd },
    },
    include: {
      transaction: {
        include: transactionInclude,
      },
    },
  })

  const overrideMap = new Map(
    overrides.map((override) => [
      makeOverrideKey(override.recurringRuleId, override.occurrenceDate),
      override,
    ])
  )

  const occurrences: RecurringOccurrence[] = []

  for (const rule of rules) {
    const occurrenceDates = calculateOccurrenceDates(
      rule,
      periodStart,
      periodEnd
    )

    for (const occurrenceDate of occurrenceDates) {
      const override = overrideMap.get(makeOverrideKey(rule.id, occurrenceDate))

      if (override?.isCancelled) {
        continue
      }

      if (override?.transaction) {
        occurrences.push({
          ...override.transaction,
          installmentGroupId: override.transaction.installmentGroupId,
          installmentNumber: override.transaction.installmentNumber,
          installmentCount:
            override.transaction.installmentGroup?.count ?? null,
          recurringRuleId: rule.id,
        })
        continue
      }

      occurrences.push(makeVirtualOccurrence(rule, occurrenceDate))
    }
  }

  return occurrences
}
