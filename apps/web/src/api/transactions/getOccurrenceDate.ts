import type { Transaction } from './types'

export const getOccurrenceDate = (transaction: Transaction): string =>
  transaction.occurrenceDate ?? transaction.date.slice(0, 10)
