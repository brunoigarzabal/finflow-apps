import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { installmentGroupRepository } from '@/shared/database/repositories/installment-group.repository.js'
import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { transactionRepository } from '@/shared/database/repositories/transaction.repository.js'
import { BadRequest } from '@/shared/infra/http/errors/index.js'
import { buildInstallments } from '../helpers/installments.js'
import { recalculateBalance } from '../helpers/recalculate-balance.js'
import { validateBankAccount } from '../helpers/validate-bank-account.js'
import { validateCategory } from '../helpers/validate-category.js'
import {
  createTransactionBody,
  createTransactionResponse,
} from './create-transaction.schema.js'

export async function createTransactionHandler(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        security: [{ bearer: [] }],
        body: createTransactionBody,
        response: { 201: createTransactionResponse },
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()
      const input = request.body

      if (input.type === 'TRANSFER' && !input.destinationBankAccountId) {
        throw new BadRequest(
          'Conta de destino é obrigatória para transferências'
        )
      }

      if (input.type !== 'TRANSFER' && input.destinationBankAccountId) {
        throw new BadRequest(
          'Conta de destino só é permitida para transferências'
        )
      }

      if (input.type !== 'TRANSFER' && !input.categoryId) {
        throw new BadRequest('Categoria é obrigatória')
      }

      if ((input.installment || input.recurring) && input.type === 'TRANSFER') {
        throw new BadRequest(
          'Transferências não suportam parcelamento ou recorrência'
        )
      }

      if (input.recurring?.endDate && input.recurring.endDate < input.date) {
        throw new BadRequest(
          'Data final da recorrência deve ser maior ou igual à data inicial'
        )
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

        if (input.recurring) {
          if (!input.categoryId) {
            throw new BadRequest('Categoria é obrigatória para recorrência')
          }

          const recurringRuleRepo = recurringRuleRepository(tx)
          const recurringRule = await recurringRuleRepo.create({
            type: input.type,
            amount: input.amount,
            description: input.description,
            frequency: input.recurring.frequency,
            startDate: dateValue,
            endDate: input.recurring.endDate
              ? new Date(input.recurring.endDate)
              : null,
            isPaid: input.isPaid,
            notes: input.notes ?? null,
            userId,
            bankAccountId: input.bankAccountId,
            categoryId: input.categoryId,
          })

          return { recurringRule }
        }

        if (input.installment) {
          const installmentGroupRepo = installmentGroupRepository(tx)
          const installmentGroup = await installmentGroupRepo.create({
            totalAmount: input.amount,
            count: input.installment.count,
            frequency: input.installment.frequency,
            userId,
          })

          const installments = buildInstallments({
            amount: input.amount,
            count: input.installment.count,
            frequency: input.installment.frequency,
            startDate: dateValue,
            description: input.description,
          })

          const transactions: Awaited<ReturnType<typeof repo.create>>[] = []
          for (const installment of installments) {
            const transaction = await repo.create({
              type: input.type,
              amount: installment.amount,
              description: installment.description,
              date: installment.date,
              isPaid: input.isPaid,
              notes: input.notes ?? null,
              userId,
              bankAccountId: input.bankAccountId,
              categoryId: input.categoryId,
              installmentGroupId: installmentGroup.id,
              installmentNumber: installment.installmentNumber,
            })
            transactions.push(transaction)
          }

          if (input.isPaid) {
            await recalculateBalance(tx, input.bankAccountId)
          }

          return { installmentGroup, transactions }
        }

        if (input.type === 'TRANSFER') {
          await validateBankAccount(
            tx,
            userId,
            input.destinationBankAccountId!,
            'Conta de destino'
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
            await Promise.all([
              recalculateBalance(tx, input.bankAccountId),
              recalculateBalance(tx, input.destinationBankAccountId!),
            ])
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
    }
  )
}
