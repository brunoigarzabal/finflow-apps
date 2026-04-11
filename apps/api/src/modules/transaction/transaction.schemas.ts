import { z } from 'zod'

import { TransactionType } from '../../../generated/prisma/enums.js'

const transactionType = z.enum(TransactionType)
const transactionAmount = z.int().min(1)
const transactionDescription = z.string().trim().min(1).max(255)
const transactionDate = z.string().date()
const transactionNotes = z.string().trim().max(500)

export const createTransactionBody = z.object({
  type: transactionType,
  amount: transactionAmount,
  description: transactionDescription,
  date: transactionDate,
  bankAccountId: z.uuid(),
  categoryId: z.uuid(),
  isPaid: z.boolean().default(true),
  notes: transactionNotes.nullable().optional(),
  destinationBankAccountId: z.uuid().optional(),
})

export const updateTransactionBody = z
  .object({
    amount: transactionAmount,
    description: transactionDescription,
    date: transactionDate,
    bankAccountId: z.uuid(),
    categoryId: z.uuid(),
    isPaid: z.boolean(),
    notes: transactionNotes.nullable(),
  })
  .partial()

export const listTransactionsQuery = z.object({
  bankAccountId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  type: transactionType.optional(),
  startDate: transactionDate.optional(),
  endDate: transactionDate.optional(),
  isPaid: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
})

export const summaryQuery = z.object({
  bankAccountId: z.uuid().optional(),
  startDate: transactionDate.optional(),
  endDate: transactionDate.optional(),
})

export const transactionIdParam = z.object({
  id: z.uuid(),
})

const bankAccountBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

const categoryBasic = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
})

export const transactionResponse = z.object({
  id: z.uuid(),
  type: transactionType,
  amount: z.int(),
  description: z.string(),
  date: z.date(),
  isPaid: z.boolean(),
  notes: z.string().nullable(),
  transferId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bankAccount: bankAccountBasic,
  category: categoryBasic,
})

export const transactionDetailResponse = transactionResponse.extend({
  relatedTransaction: z
    .object({
      id: z.uuid(),
      amount: z.int(),
      type: transactionType,
      bankAccount: bankAccountBasic,
    })
    .nullable(),
})

export const transactionListResponse = z.object({
  transactions: z.array(transactionResponse),
  pagination: z.object({
    page: z.int(),
    perPage: z.int(),
    total: z.int(),
    totalPages: z.int(),
  }),
})

export const summaryResponse = z.object({
  summary: z.object({
    totalIncome: z.int(),
    totalExpense: z.int(),
    balance: z.int(),
  }),
})
