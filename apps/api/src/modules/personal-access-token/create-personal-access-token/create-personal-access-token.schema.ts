import { z } from 'zod'

import { personalAccessTokenResponse } from '../schemas.js'

export const createPersonalAccessTokenBody = z.object({
  name: z.string().trim().min(1).max(60),
})

export const createPersonalAccessTokenResponse = z.object({
  personalAccessToken: personalAccessTokenResponse,
  token: z.string(),
})
