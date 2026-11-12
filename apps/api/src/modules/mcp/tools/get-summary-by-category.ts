import { z } from 'zod'

import { categoryType } from '@/modules/category/schemas.js'
import { getSummaryByCategory } from '@/modules/transaction/get-summary-by-category/get-summary-by-category.js'

import { bankAccountIdInput, periodInput } from '../helpers/schemas.js'
import {
  READ_ONLY_ANNOTATIONS,
  toolHandler,
  type ToolContext,
} from '../helpers/tool-context.js'

const NAME = 'get_summary_by_category'

export function registerGetSummaryByCategoryTool(ctx: ToolContext) {
  ctx.server.registerTool(
    NAME,
    {
      title: 'Totais por categoria',
      description:
        'Total e percentual de cada categoria no período, do maior para o menor. Use type EXPENSE para gastos e INCOME para receitas.',
      inputSchema: {
        type: categoryType.describe('EXPENSE (gastos) ou INCOME (receitas)'),
        ...periodInput,
        bankAccountId: bankAccountIdInput,
        isPaid: z
          .boolean()
          .optional()
          .describe('true só pagos, false só pendentes. Omitir para ambos'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    toolHandler(ctx, NAME, async (input) => {
      const { summaryByCategory, total } = await getSummaryByCategory(
        ctx.prisma,
        ctx.userId,
        input
      )

      return {
        total,
        categories: summaryByCategory.map((entry) => ({
          categoryId: entry.categoryId,
          categoryName: entry.categoryName,
          totalAmount: entry.totalAmount,
          transactionCount: entry.transactionCount,
          percentageOfTotal: entry.percentageOfTotal,
        })),
      }
    })
  )
}
