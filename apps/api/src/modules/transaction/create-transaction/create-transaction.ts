import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { transactionRepository, transactionInclude } from '@/shared/database/repositories/transaction.repository.js'
import { BadRequest } from '@/shared/infra/http/errors/index.js'
import { recalculateBalance } from '../helpers/recalculate-balance.js'
import { validateBankAccount } from '../helpers/validate-bank-account.js'
import { validateCategory } from '../helpers/validate-category.js'
import { createTransactionBody, transactionDetailResponse } from './create-transaction.schema.js'

export async function createTransactionHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        security: [{ bearer: [] }],
        body: createTransactionBody,
        response: { 201: transactionDetailResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const input = request.body

      if (input.type === 'TRANSFER' && !input.destinationBankAccountId) {
        throw new BadRequest('Conta de destino é obrigatória para transferências')
      }

      if (input.type !== 'TRANSFER' && input.destinationBankAccountId) {
        throw new BadRequest('Conta de destino só é permitida para transferências')
      }

      if (input.type !== 'TRANSFER' && !input.categoryId) {
        throw new BadRequest('Categoria é obrigatória')
      }

      if (
        input.type === 'TRANSFER' &&
        input.bankAccountId === input.destinationBankAccountId
      ) {
        throw new BadRequest('Conta de origem e destino devem ser diferentes')
      }

      const result = await app.prisma.$transaction(async (tx) => {
        await validateBankAccount(tx, userId, input.bankAccountId)
        if (input.categoryId) {
          await validateCategory(tx, userId, input.categoryId)
        }

        const repo = transactionRepository(tx)
        const dateValue = new Date(input.date)

        if (input.type === 'TRANSFER') {
          await validateBankAccount(
            tx,
            userId,
            input.destinationBankAccountId!,
            'Conta de destino',
          )

          const transferId = crypto.randomUUID()

          const outgoing = await repo.create({
            type: 'TRANSFER',
            amount: input.amount,
            description: input.description,
            date: dateValue,
            isPaid: input.isPaid,
            notes: input.notes ?? null,
            transferId,
            isTransferOut: true,
            userId,
            bankAccountId: input.bankAccountId,
            categoryId: input.categoryId,
          })

          const incoming = await repo.create({
            type: 'TRANSFER',
            amount: input.amount,
            description: input.description,
            date: dateValue,
            isPaid: input.isPaid,
            notes: input.notes ?? null,
            transferId,
            isTransferOut: false,
            userId,
            bankAccountId: input.destinationBankAccountId!,
            categoryId: input.categoryId,
          })

          if (input.isPaid) {
            await recalculateBalance(tx, input.bankAccountId)
            await recalculateBalance(tx, input.destinationBankAccountId!)
          }

          return {
            ...outgoing,
            relatedTransaction: {
              id: incoming.id,
              amount: incoming.amount,
              type: incoming.type,
              bankAccount: incoming.bankAccount,
            },
          }
        }

        const transaction = await repo.create({
          type: input.type,
          amount: input.amount,
          description: input.description,
          date: dateValue,
          isPaid: input.isPaid,
          notes: input.notes ?? null,
          userId,
          bankAccountId: input.bankAccountId,
          categoryId: input.categoryId,
        })

        if (input.isPaid) {
          await recalculateBalance(tx, input.bankAccountId)
        }

        return { ...transaction, relatedTransaction: null }
      })

      return reply.status(201).send(result)
    },
  )
}
