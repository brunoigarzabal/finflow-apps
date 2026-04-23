import { z } from 'zod'

export const loginBody = z.object({
  email: z.email(),
  password: z.string(),
})

export const tokenResponse = z.object({
  token: z.string(),
})
