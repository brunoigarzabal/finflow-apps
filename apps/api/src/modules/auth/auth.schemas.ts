import { z } from 'zod'

export const registerBody = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

export const loginBody = z.object({
  email: z.email(),
  password: z.string(),
})

export const tokenResponse = z.object({
  token: z.string(),
})

export const profileResponse = z.object({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
})
