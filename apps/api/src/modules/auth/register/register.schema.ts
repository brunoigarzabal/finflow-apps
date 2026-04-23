import { z } from 'zod'

export const registerBody = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

export const tokenResponse = z.object({
  token: z.string(),
})
