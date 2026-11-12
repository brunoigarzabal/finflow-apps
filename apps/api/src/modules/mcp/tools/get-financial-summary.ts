import { getSummary } from '@/modules/transaction/get-summary/get-summary.js'

import { bankAccountIdInput, periodInput } from '../helpers/schemas.js'
import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'get_financial_summary'

export function registerGetFinancialSummaryTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Resumo financeiro do período',
      description:
        'Receitas, despesas e saldo do período. Separa valores pagos, pendentes e atrasados (de antes do período) e traz o saldo anterior ao período. Inclui ocorrências de recorrências e ignora transferências.',
      inputSchema: { ...periodInput, bankAccountId: bankAccountIdInput },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, (input) => getSummary(ctx.prisma, ctx.userId, input))
  )
}
