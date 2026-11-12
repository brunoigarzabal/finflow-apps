import { z } from 'zod'

import { bankAccountRepository } from '@/shared/database/repositories/bank-account.repository.js'

import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'list_bank_accounts'

export function registerListBankAccountsTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Listar contas bancárias',
      description:
        'Contas bancárias com saldo atual (só transações pagas). Use os ids para filtrar outras ferramentas.',
      inputSchema: {
        archived: z
          .boolean()
          .default(false)
          .describe('true para listar contas arquivadas'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, async ({ archived }) => {
      const bankAccounts = await bankAccountRepository(ctx.prisma).findMany(
        ctx.userId,
        archived
      )

      return {
        totalBalance: bankAccounts.reduce(
          (sum, account) => sum + account.currentBalance,
          0
        ),
        bankAccounts: bankAccounts.map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          currentBalance: account.currentBalance,
          initialBalance: account.initialBalance,
          isDefault: account.isDefault,
        })),
      }
    })
  )
}
