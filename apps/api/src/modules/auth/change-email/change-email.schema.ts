import { z } from 'zod'

export const changeEmailBody = z.object({
  email: z.email(),
  password: z.string(),
})

export const changeEmailResponse = z.object({
  success: z.boolean(),
})
