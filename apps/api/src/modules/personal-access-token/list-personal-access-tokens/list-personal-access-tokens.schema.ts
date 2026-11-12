import { z } from 'zod'

import { personalAccessTokenResponse } from '../schemas.js'

export const personalAccessTokenListResponse = z.object({
  personalAccessTokens: z.array(personalAccessTokenResponse),
})
