import { z } from 'zod'

import { installmentScope, transactionIdParam } from '../schemas.js'

export const deleteTransactionBody = z
  .object({
    scope: installmentScope,
  })
  .partial()
  .default({})

export { transactionIdParam }
