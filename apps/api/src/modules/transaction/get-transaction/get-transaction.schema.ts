import { z } from 'zod'

import {
  transactionType,
  transactionIdParam,
  transactionResponse,
  bankAccountBasic,
} from '../schemas.js'

export const transactionDetailResponse = transactionResponse.extend({
  relatedTransaction: z
    .object({
      id: z.uuid(),
      amount: z.int(),
      type: transactionType,
      bankAccount: bankAccountBasic,
    })
    .nullable(),
})

export { transactionIdParam }
