import type { Prisma, PrismaClient } from '../../../../generated/prisma/client.js'
import type { TransactionType } from '../../../../generated/prisma/enums.js'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'

type TransactionClient = Prisma.TransactionClient
type PrismaArg = PrismaClient | TransactionClient

type AggregationRow = {
  type: TransactionType
  isTransferOut: boolean | null
  _sum: { amount: number | null }
}

export function splitIncomeExpense(aggregations: AggregationRow[]) {
  let income = 0
  let expense = 0
  for (const agg of aggregations) {
    const sum = agg._sum.amount ?? 0
    if (agg.type === 'INCOME') {
      income += sum
    } else if (agg.type === 'EXPENSE') {
      expense += sum
    } else if (agg.type === 'TRANSFER') {
      if (agg.isTransferOut) {
        expense += sum
      } else {
        income += sum
      }
    }
  }
  return { income, expense }
}

export function computeNet(aggregations: AggregationRow[]): number {
  const { income, expense } = splitIncomeExpense(aggregations)
  return income - expense
}

export async function recalculateBalance(
  prisma: PrismaArg,
  bankAccountId: string,
): Promise<void> {
  const bankAccountRepo = bankAccountRepository(prisma)
  const transactionRepo = transactionRepository(prisma)

  const account = await bankAccountRepo.findByIdOrThrow(bankAccountId)

  const aggregations = await transactionRepo.groupBy({
    bankAccountId,
    isPaid: true,
  })

  await bankAccountRepo.update(bankAccountId, {
    currentBalance: account.initialBalance + computeNet(aggregations),
  })
}
