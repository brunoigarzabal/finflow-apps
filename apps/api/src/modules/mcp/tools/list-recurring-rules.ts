import { recurringRuleRepository } from '@/shared/database/repositories/recurring-rule.repository.js'
import { formatDateLocal } from '@/shared/helpers/date.js'

import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'list_recurring_rules'

export function registerListRecurringRulesTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Listar recorrências',
      description:
        'Receitas e despesas recorrentes ativas (assinaturas, salário, aluguel...), com frequência e vigência.',
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, async () => {
      const recurringRules = await recurringRuleRepository(
        ctx.prisma
      ).findActiveByUser(ctx.userId)

      return {
        recurringRules: recurringRules.map((rule) => ({
          id: rule.id,
          type: rule.type,
          description: rule.description,
          amount: rule.amount,
          frequency: rule.frequency,
          startDate: formatDateLocal(rule.startDate),
          endDate: rule.endDate ? formatDateLocal(rule.endDate) : null,
          bankAccount: rule.bankAccount.name,
          category: rule.category.name,
          notes: rule.notes,
        })),
      }
    })
  )
}
