import { z } from 'zod'

import { getSummaryByPeriod } from '@/modules/transaction/get-summary-by-period/get-summary-by-period.js'

import { bankAccountIdInput } from '../helpers/schemas.js'
import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'get_monthly_history'

export function registerGetMonthlyHistoryTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Histórico mensal',
      description:
        'Receitas, despesas e saldo de cada mês, terminando no mês atual. Considera só transações pagas. Bom para comparar meses e ver tendências.',
      inputSchema: {
        months: z
          .int()
          .min(2)
          .max(24)
          .default(12)
          .describe('Quantidade de meses (2 a 24). Padrão: 12'),
        bankAccountId: bankAccountIdInput,
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, (input) =>
      getSummaryByPeriod(ctx.prisma, ctx.userId, input)
    )
  )
}
