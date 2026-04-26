import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { BadRequest, NotFound } from '@/shared/infra/http/errors/index.js'
import { recalculateBalance } from '../helpers/recalculate-balance.js'
import { validateBankAccount } from '../helpers/validate-bank-account.js'
import { validateCategory } from '../helpers/validate-category.js'
import { updateTransactionBody, transactionIdParam, transactionResponse } from './update-transaction.schema.js'

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
        const existing = await repo.findByIdRaw(request.params.id)

        if (!existing || existing.userId !== userId) {
          throw new NotFound('Transação não encontrada')
        }

        if (existing.type === 'TRANSFER' && input.bankAccountId) {
          throw new BadRequest(
            'Não é possível alterar a conta de uma transferência',
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
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
          ...(input.bankAccountId ? { bankAccountId: input.bankAccountId } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        }

        if (input.scope === 'ALL_REMAINING' && existing.installmentGroupId) {
          const remainingTransactions = await repo.findMany({
            userId,
            installmentGroupId: existing.installmentGroupId,
            date: { gte: existing.date },
          })

          await repo.updateMany(
            {
              userId,
              installmentGroupId: existing.installmentGroupId,
              date: { gte: existing.date },
            },
            updateData,
          )

          const affectedAccountIds = new Set(
            remainingTransactions.map((transaction) => transaction.bankAccountId),
          )
          if (input.bankAccountId) {
            affectedAccountIds.add(input.bankAccountId)
          }

          for (const accountId of affectedAccountIds) {
            await recalculateBalance(tx, accountId)
          }

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
              pairedUpdateData,
            )
          }

          const paired = await repo.findRelated(existing.transferId, request.params.id)

          await recalculateBalance(tx, existing.bankAccountId)
          if (paired) {
            await recalculateBalance(tx, paired.bankAccountId)
          }

          return updated
        }

        const updated = await repo.update(request.params.id, updateData)

        const affectedAccountIds = new Set([existing.bankAccountId])
        if (input.bankAccountId && input.bankAccountId !== existing.bankAccountId) {
          affectedAccountIds.add(input.bankAccountId)
        }

        for (const accountId of affectedAccountIds) {
          await recalculateBalance(tx, accountId)
        }

        return updated
      })
    },
  )
}
