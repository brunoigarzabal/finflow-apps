import type { FastifyInstance } from 'fastify'

import { archiveBankAccountHandler } from './archive-bank-account/archive-bank-account.js'
import { createBankAccountHandler } from './create-bank-account/create-bank-account.js'
import { getBankAccountHandler } from './get-bank-account/get-bank-account.js'
import { listBankAccountsHandler } from './list-bank-accounts/list-bank-accounts.js'
import { restoreBankAccountHandler } from './restore-bank-account/restore-bank-account.js'
import { updateBankAccountHandler } from './update-bank-account/update-bank-account.js'

export async function bankAccountRoutes(app: FastifyInstance) {
  app.register(listBankAccountsHandler)
  app.register(getBankAccountHandler)
  app.register(createBankAccountHandler)
  app.register(updateBankAccountHandler)
  app.register(archiveBankAccountHandler)
  app.register(restoreBankAccountHandler)
}
