import { registerGetFinancialSummaryTool } from './get-financial-summary.js'
import { registerGetMonthlyHistoryTool } from './get-monthly-history.js'
import { registerGetSummaryByCategoryTool } from './get-summary-by-category.js'
import { registerListBankAccountsTool } from './list-bank-accounts.js'
import { registerListCategoriesTool } from './list-categories.js'
import { registerListRecurringRulesTool } from './list-recurring-rules.js'
import { registerListTransactionsTool } from './list-transactions.js'

export const MCP_TOOLS = [
  registerGetFinancialSummaryTool,
  registerGetSummaryByCategoryTool,
  registerGetMonthlyHistoryTool,
  registerListTransactionsTool,
  registerListBankAccountsTool,
  registerListCategoriesTool,
  registerListRecurringRulesTool,
]
