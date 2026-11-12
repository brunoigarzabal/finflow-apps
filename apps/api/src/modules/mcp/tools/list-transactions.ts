import { z } from 'zod'

import { listTransactions } from '@/modules/transaction/list-transactions/list-transactions.js'
import { transactionType } from '@/modules/transaction/schemas.js'
import { formatDateLocal } from '@/shared/helpers/date.js'

import { bankAccountIdInput, periodInput } from '../helpers/schemas.js'
import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'list_transactions'

export function registerListTransactionsTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Listar transações',
      description:
        'Transações do período, da mais recente para a mais antiga, incluindo ocorrências de recorrências. Prefira períodos curtos; para totais use get_financial_summary ou get_summary_by_category.',
      inputSchema: {
        ...periodInput,
        bankAccountId: bankAccountIdInput,
        categoryId: z
          .uuid()
          .optional()
          .describe('Filtra por categoria (id de list_categories)'),
        type: transactionType
          .optional()
          .describe('INCOME, EXPENSE ou TRANSFER'),
        isPaid: z
          .boolean()
          .optional()
          .describe('true só pagas, false só pendentes. Omitir para ambas'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, async (input) => {
      const { transactions } = await listTransactions(
        ctx.prisma,
        ctx.userId,
        input
      )

      return {
        count: transactions.length,
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          date: formatDateLocal(transaction.date),
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          isPaid: transaction.isPaid,
          notes: transaction.notes,
          bankAccount: transaction.bankAccount.name,
          category: transaction.category?.name ?? null,
          relatedBankAccount: transaction.relatedBankAccount?.name ?? null,
          installment: transaction.installmentNumber
            ? `${transaction.installmentNumber}/${transaction.installmentCount ?? '?'}`
            : null,
          isRecurring:
            'isVirtual' in transaction && transaction.isVirtual === true,
        })),
      }
    })
  )
}
