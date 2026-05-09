import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'

import type { Prisma } from '../../../../generated/prisma/client.js'

import { recalculateBalance } from './recalculate-balance.js'

type TransactionClient = Prisma.TransactionClient

type Params = {
  ruleId: string
  occurrenceDate: Date
  transactionData: Prisma.TransactionUncheckedCreateInput
  existingTransactionId?: string
  accountIdsToRecalculate: Iterable<string>
}

export async function materializeRecurringOccurrence(
  tx: TransactionClient,
  {
    ruleId,
    occurrenceDate,
    transactionData,
    existingTransactionId,
    accountIdsToRecalculate,
  }: Params
) {
  const transactionRepo = transactionRepository(tx)
  const recurringOverrideRepo = recurringOverrideRepository(tx)

  const transaction = existingTransactionId
    ? await transactionRepo.update(existingTransactionId, transactionData)
    : await transactionRepo.create(transactionData)

  await recurringOverrideRepo.upsert(ruleId, occurrenceDate, {
    isCancelled: false,
    transactionId: transaction.id,
  })

  for (const accountId of new Set(accountIdsToRecalculate)) {
    await recalculateBalance(tx, accountId)
  }

  return transaction
}
