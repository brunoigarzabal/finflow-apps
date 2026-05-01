import type { FastifyInstance } from 'fastify'

import { createTransactionHandler } from './create-transaction/create-transaction.js'
import { deleteTransactionHandler } from './delete-transaction/delete-transaction.js'
import { getBalanceOverTimeHandler } from './get-balance-over-time/get-balance-over-time.js'
import { getSummaryHandler } from './get-summary/get-summary.js'
import { getSummaryByCategoryHandler } from './get-summary-by-category/get-summary-by-category.js'
import { getSummaryByPeriodHandler } from './get-summary-by-period/get-summary-by-period.js'
import { getTransactionHandler } from './get-transaction/get-transaction.js'
import { listTransactionsHandler } from './list-transactions/list-transactions.js'
import { updateTransactionHandler } from './update-transaction/update-transaction.js'

export async function transactionRoutes(app: FastifyInstance) {
  app.register(getSummaryHandler)
  app.register(getSummaryByCategoryHandler)
  app.register(getSummaryByPeriodHandler)
  app.register(getBalanceOverTimeHandler)
  app.register(listTransactionsHandler)
  app.register(getTransactionHandler)
  app.register(createTransactionHandler)
  app.register(updateTransactionHandler)
  app.register(deleteTransactionHandler)
}
