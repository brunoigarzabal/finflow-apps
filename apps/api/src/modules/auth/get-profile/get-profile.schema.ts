import { z } from 'zod'

export const profileResponse = z.object({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
})
