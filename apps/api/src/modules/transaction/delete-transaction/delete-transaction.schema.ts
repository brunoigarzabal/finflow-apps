import { z } from 'zod'

import { installmentScope, transactionIdParam } from '../schemas.js'

export const deleteTransactionBody = z.preprocess(
  (body) => body ?? {},
  z
    .object({
      scope: installmentScope,
    })
    .partial()
)

export { transactionIdParam }
