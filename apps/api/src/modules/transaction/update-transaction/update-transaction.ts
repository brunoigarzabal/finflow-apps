import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { recurringOverrideRepository } from '@/shared/database/repositories/recurring-override.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { addMonthsPreservingDay } from '@/shared/helpers/date.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'
import { monthsByInstallmentFrequency } from '../helpers/installments.js'
import { recalculateBalance } from '../helpers/recalculate-balance.js'
import { validateBankAccount } from '../helpers/validate-bank-account.js'
import { validateCategory } from '../helpers/validate-category.js'
import {
  updateTransactionBody,
  transactionIdParam,
  transactionResponse,
} from './update-transaction.schema.js'

export async function updateTransactionHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Update a transaction',
        security: [{ bearer: [] }],
        params: transactionIdParam,
        body: updateTransactionBody,
        response: { 200: transactionResponse },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()
      const input = request.body

      return app.prisma.$transaction(async (tx) => {
        const repo = transactionRepository(tx)
        const recurringOverrideRepo = recurringOverrideRepository(tx)
        const recurringRuleRepo = recurringRuleRepository(tx)
        const existing = await repo.findByIdRaw(request.params.id)

        if (!existing || existing.userId !== userId) {
          throw new NotFound('Transação não encontrada')
        }

        if (input.recurring && existing.type === 'TRANSFER') {
          throw new BadRequest('Transferências não suportam recorrência')
        }

        const recurringOverride = input.recurring
          ? await recurringOverrideRepo.findMany({ transactionId: existing.id })
          : []

        if (recurringOverride.length > 0) {
          throw new BadRequest('Transação já faz parte de uma recorrência')
        }

        if (existing.type === 'TRANSFER' && input.bankAccountId) {
          throw new BadRequest(
            'Não é possível alterar a conta de uma transferência'
          )
        }

        if (input.bankAccountId) {
          await validateBankAccount(tx, userId, input.bankAccountId)
        }

        if (input.categoryId) {
          await validateCategory(tx, userId, input.categoryId)
        }

        const updateData = {
          ...(input.amount !== undefined ? { amount: input.amount } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
          ...(input.bankAccountId
            ? { bankAccountId: input.bankAccountId }
            : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        }

        if (input.recurring) {
          const occurrenceDate = input.date
            ? new Date(input.date)
            : existing.date
          const categoryId = input.categoryId ?? existing.categoryId
          const bankAccountId = input.bankAccountId ?? existing.bankAccountId

          if (!categoryId) {
            throw new BadRequest('Categoria é obrigatória para recorrência')
          }

          if (
            input.recurring.endDate &&
            input.recurring.endDate < occurrenceDate.toISOString().slice(0, 10)
          ) {
            throw new BadRequest(
              'Data final da recorrência deve ser maior ou igual à data inicial'
            )
          }

          const updated = await repo.update(request.params.id, updateData)
          const recurringRule = await recurringRuleRepo.create({
            type: existing.type,
            amount: updated.amount,
            description: updated.description,
            frequency: input.recurring.frequency,
            startDate: occurrenceDate,
            endDate: input.recurring.endDate
              ? new Date(input.recurring.endDate)
              : null,
            isPaid: updated.isPaid,
            notes: updated.notes,
            userId,
            bankAccountId,
            categoryId,
          })

          await recurringOverrideRepo.upsert(recurringRule.id, occurrenceDate, {
            isCancelled: false,
            transactionId: updated.id,
          })

          const affectedAccountIds = new Set([existing.bankAccountId])
          if (bankAccountId !== existing.bankAccountId) {
            affectedAccountIds.add(bankAccountId)
          }

          await Promise.all(
            [...affectedAccountIds].map((id) => recalculateBalance(tx, id))
          )

          return updated
        }

        if (input.scope === 'ALL_REMAINING' && existing.installmentGroupId) {
          const remainingTransactions = await repo.findMany({
            userId,
            installmentGroupId: existing.installmentGroupId,
            date: { gte: existing.date },
          })

          if (input.date) {
            const baseDate = new Date(input.date)
            const frequency =
              remainingTransactions[0]?.installmentGroup?.frequency ?? 'MONTHLY'
            const months = monthsByInstallmentFrequency(frequency)

            for (const [
              index,
              transaction,
            ] of remainingTransactions.entries()) {
              await repo.update(transaction.id, {
                ...updateData,
                date: addMonthsPreservingDay(baseDate, index * months),
              })
            }
          } else {
            await repo.updateMany(
              {
                userId,
                installmentGroupId: existing.installmentGroupId,
                date: { gte: existing.date },
              },
              updateData
            )
          }

          const affectedAccountIds = new Set(
            remainingTransactions.map(
              (transaction) => transaction.bankAccountId
            )
          )
          if (input.bankAccountId) {
            affectedAccountIds.add(input.bankAccountId)
          }

          await Promise.all(
            [...affectedAccountIds].map((id) => recalculateBalance(tx, id))
          )

          const updated = await repo.findById(request.params.id)
          if (!updated) {
            throw new NotFound('Transação não encontrada')
          }
          return updated
        }

        if (existing.type === 'TRANSFER' && existing.transferId) {
          const pairedUpdateData = {
            ...(input.amount !== undefined ? { amount: input.amount } : {}),
            ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
            ...(input.categoryId ? { categoryId: input.categoryId } : {}),
            ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
          }

          const updated = await repo.update(request.params.id, updateData)

          if (Object.keys(pairedUpdateData).length > 0) {
            await repo.updateMany(
              {
                transferId: existing.transferId,
                id: { not: request.params.id },
              },
              pairedUpdateData
            )
          }

          const paired = await repo.findRelated(
            existing.transferId,
            request.params.id
          )

          const balancePromises = [recalculateBalance(tx, existing.bankAccountId)]
          if (paired) {
            balancePromises.push(recalculateBalance(tx, paired.bankAccountId))
          }
          await Promise.all(balancePromises)

          return updated
        }

        const updated = await repo.update(request.params.id, updateData)

        const affectedAccountIds = new Set([existing.bankAccountId])
        if (
          input.bankAccountId &&
          input.bankAccountId !== existing.bankAccountId
        ) {
          affectedAccountIds.add(input.bankAccountId)
        }

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }

        return updated
      })
    }
  )
}
