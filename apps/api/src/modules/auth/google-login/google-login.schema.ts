import { z } from 'zod'

export const googleLoginBody = z.object({
  idToken: z.string(),
})

export const tokenResponse = z.object({
  token: z.string(),
})
