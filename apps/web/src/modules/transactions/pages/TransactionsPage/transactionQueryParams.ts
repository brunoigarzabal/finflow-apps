import { endOfMonth, format, isValid, parse, startOfMonth } from 'date-fns'
import { createParser, parseAsString } from 'nuqs'

import type {
  ListTransactionsParams,
  SummaryParams,
  TransactionType,
} from '@/api/transactions'

export type TransactionStatusFilter = 'PAID' | 'PENDING'

export type TransactionFilterValues = {
  account: string
  category: string
  type: TransactionType | ''
  status: TransactionStatusFilter | ''
}

type TransactionQueryValues = TransactionFilterValues & {
  period: string
}

const PERIOD_FORMAT = 'yyyy-MM'
const PERIOD_DATE_FORMAT = 'yyyy-MM-dd'
const PERIOD_PATTERN = /^\d{4}-\d{2}$/

const parsePeriodDate = (period: string) =>
  parse(`${period}-01`, PERIOD_DATE_FORMAT, new Date())

const parsePeriod = (value: string) => {
  if (!PERIOD_PATTERN.test(value)) return null

  const date = parsePeriodDate(value)
  if (!isValid(date)) return null

  return value
}

const parseTransactionType = (value: string): TransactionType | '' | null => {
  if (value === 'INCOME') return value
  if (value === 'EXPENSE') return value
  if (value === 'TRANSFER') return value

  return null
}

const parseStatus = (value: string): TransactionStatusFilter | '' | null => {
  if (value === 'PAID') return value
  if (value === 'PENDING') return value

  return null
}

const resolveIsPaidFilter = (value: TransactionStatusFilter | '') => {
  if (value === 'PAID') return true
  if (value === 'PENDING') return false

  return undefined
}

export const getCurrentPeriod = () => format(new Date(), PERIOD_FORMAT)

export const formatPeriod = (date: Date) => format(date, PERIOD_FORMAT)

export const getPeriodDate = (period: string) => parsePeriodDate(period)

export const transactionQueryParsers = {
  period: createParser({
    parse: parsePeriod,
    serialize: (value: string) => value,
  }).withDefault(getCurrentPeriod()),
  account: parseAsString.withDefault(''),
  category: parseAsString.withDefault(''),
  type: createParser<TransactionType | ''>({
    parse: parseTransactionType,
    serialize: (value) => value,
  }).withDefault(''),
  status: createParser<TransactionStatusFilter | ''>({
    parse: parseStatus,
    serialize: (value) => value,
  }).withDefault(''),
}

export const getTransactionFilters = ({
  account,
  category,
  type,
  status,
}: TransactionQueryValues): TransactionFilterValues => ({
  account,
  category,
  type,
  status,
})

export const getPeriodDateRange = (period: string) => {
  const date = getPeriodDate(period)

  return {
    startDate: format(startOfMonth(date), PERIOD_DATE_FORMAT),
    endDate: format(endOfMonth(date), PERIOD_DATE_FORMAT),
  }
}

export const toTransactionListParams = (
  filters: TransactionQueryValues
): ListTransactionsParams => {
  const { startDate, endDate } = getPeriodDateRange(filters.period)
  const isPaid = resolveIsPaidFilter(filters.status)

  return {
    startDate,
    endDate,
    ...(filters.type ? { type: filters.type } : {}),
    ...(isPaid === undefined ? {} : { isPaid }),
    ...(filters.account ? { bankAccountId: filters.account } : {}),
    ...(filters.category ? { categoryId: filters.category } : {}),
  }
}

export const toTransactionSummaryParams = (
  filters: TransactionQueryValues
): SummaryParams => {
  const { startDate, endDate } = getPeriodDateRange(filters.period)

  return {
    startDate,
    endDate,
    ...(filters.account ? { bankAccountId: filters.account } : {}),
  }
}
